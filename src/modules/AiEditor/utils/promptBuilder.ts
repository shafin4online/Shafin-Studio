import { PhotoSizeId, BgColorId, DressCustomization } from '../types/aiEditorTypes';
import { PHOTO_SIZES, BG_COLORS, DRESS_OPTIONS, ENHANCEMENT_OPTIONS } from '../data/presetsData';

export const PHOTO_PROMPTS = {
  // 1. Master Base Prompt — applied to every generation
  base: `Edit the provided photograph into a professional, realistic identification photo.

Preserve the person's exact identity and recognizable appearance.
Preserve facial structure, face shape, eyes, nose, lips, ears, hairline, hairstyle and natural body proportions unless an explicitly selected instruction requires a change.

Do not create a different person.
Do not significantly alter age, facial structure or natural proportions.

Keep the result photorealistic, natural and suitable for official identification purposes.

Preserve realistic skin texture, fine pores and natural facial details.
Avoid excessive beauty filters, plastic-looking skin or artificial facial features.`,

  // 2. Photo Framing & Size Standards
  sizes: {
    passport: `Create a professional passport-size identification photo with the face centered, properly positioned and evenly framed with balanced headroom and shoulder symmetry.`,
    dual: `Create a professional dual-person identification photo. Keep both people clearly visible, properly positioned, proportionate, and naturally aligned side-by-side with balanced head height and equal focal depth.`,
    epass: `Create a professional e-passport style identification photo with standardized head positioning, centered face and balanced framing.`,
    visa: `Create a professional visa-style identification photo with appropriate head positioning, centered face and balanced official-photo framing complying with international visa standards.`,
    birth: `Create a professional birth-registration/document photo with a clear centered face, appropriate head positioning and official-photo framing.`
  },

  // 3. Background Standards
  backgrounds: {
    white: `Use a clean, uniform pure white background (#FFFFFF) with even illumination.`,
    'light-blue': `Use a clean, uniform solid light-blue background (#3B82F6) with even illumination.`,
    'sky-blue': `Use a clean, uniform sky-blue background (#00A3E0) with even illumination.`,
    grey: `Use a clean, uniform neutral gray background (#8E9297) with even illumination.`,
    'royal-blue': `Use a clean, uniform professional royal-blue background (#2563EB) with even illumination.`,
    'deep-green': `Use a clean, uniform teal-green background (#007058) with even illumination.`,
    'off-white': `Use a clean, uniform warm cream off-white background (#F6F6EB) with even illumination.`
  } as Record<string, string>,

  backgroundCommon: `Remove unwanted background shadows and keep the background evenly illuminated, clean and uniform throughout.`,

  // 4. Additional Enhancements (10 standard + custom)
  enhancements: {
    'beauty-enhance': `Apply subtle natural facial enhancement while preserving the person's exact identity, facial structure and natural appearance. Keep the result realistic and professional.`,
    'skin-smooth': `Smooth minor skin imperfections naturally while preserving realistic skin texture, pores and fine facial details. Avoid plastic-looking skin.`,
    'oil-control': `Reduce excessive facial oil, shine, hot-spots and unwanted skin reflections while preserving natural skin texture and realistic facial details.`,
    'brighten-photo': `Improve the overall brightness, exposure and shadow clarity of the photograph while preserving natural skin tones and realistic facial details.`,
    'studio-lighting': `Apply soft, professional studio lighting with balanced illumination across the face and body. Reduce harsh lighting and unwanted shadows while keeping the result natural.`,
    'head-straighten': `Straighten the person's head into a natural, front-facing identification-photo position while preserving facial identity, facial proportions and natural appearance.`,
    'half-body': `Extend or reframe the composition naturally to show an appropriate half-body view while preserving the person's original identity, body proportions and realistic appearance.`,
    'preserve-mole-scar': `Preserve all natural facial marks, moles, birthmarks, scars and distinctive facial features exactly as they appear in the original photograph. Do not remove or alter them.`,
    'preserve-nose-pin': `Preserve any traditional nose jewelry, nose pin (নাকফুল), and ear piercings exactly as in the original photo. Do not remove or alter them as blemishes. Keep the natural nose shape intact.`,
    'lipstick-retouch': `Apply subtle, natural-looking lipstick while preserving the person's original lip shape, size and facial identity. Keep the result realistic and professional.`
  } as Record<string, string>,

  // 5. Global Priority & Negative Guardrails
  priorityAndNegative: `PRIORITY RULES & NEGATIVE CONSTRAINTS:
- Preserve identity and unique facial anatomy above all other editing instructions.
- Apply only the requested modifications; do not make unnecessary changes to the person's face, hair, body, or appearance.
- The replacement attire must naturally conform to the subject's neck, shoulders and chest, and inherit the exact ambient lighting direction, color temperature, and realistic shadow falloff from the face.
- Produce a sharp, high-resolution, photorealistic studio result with realistic skin texture and natural facial details.
- NEGATIVE CONSTRAINTS: No plastic skin, no doll-like smoothing, no altered eye gaze, no teeth whitening unless naturally visible, no floating collars, no distorted ears or hairlines, no cartoon or painterly artifacts.`
};

export interface PromptGenerationParams {
  sizeId: PhotoSizeId;
  bgId: BgColorId;
  customBgHex?: string;
  dressId: string;
  dressCustomization?: DressCustomization;
  // Dual mode params
  leftDressId?: string;
  leftDressCustomization?: DressCustomization;
  rightDressId?: string;
  rightDressCustomization?: DressCustomization;
  enhancementIds: string[];
  customInstruction?: string;
}

function buildAttireDescription(
  dressId: string, 
  customization?: DressCustomization, 
  subjectLabel: string = "the subject"
): string {
  if (!dressId || dressId === 'none') {
    return `Keep ${subjectLabel}'s original clothing unchanged from the input photo, only cleaning up loose wrinkles or fuzz.`;
  }

  const dressPreset = DRESS_OPTIONS.find(d => d.id === dressId);
  const baseDescription = dressPreset?.promptDescription || 'Change attire to clean professional formal clothing.';

  if (!customization) {
    return `${baseDescription} Make the clothing realistic, naturally fitted and aligned with ${subjectLabel}'s body.`;
  }

  const colorDetail = `Fabric color: ${customization.colorLabel} (${customization.colorHex}).`;
  const patternDetail = customization.isCheckPattern 
    ? 'Pattern: Classic crisp checkered plaid pattern (চেক প্যাটার্ন / check grid).' 
    : '';
  const tieDetail = customization.hasTie 
    ? 'Accessory: Formal tailored necktie neatly knotted at the collar (টাই).' 
    : '';

  return [
    baseDescription,
    colorDetail,
    patternDetail,
    tieDetail,
    `Make the clothing realistic, photorealistically tailored, and naturally fitted to ${subjectLabel}'s shoulders, neck, and chest.`
  ].filter(Boolean).join(' ');
}

export function buildDynamicPrompt(params: PromptGenerationParams): string {
  const { 
    sizeId, 
    bgId, 
    customBgHex, 
    dressId, 
    dressCustomization, 
    leftDressId,
    leftDressCustomization,
    rightDressId,
    rightDressCustomization,
    enhancementIds, 
    customInstruction 
  } = params;

  const sections: string[] = [];

  // [1] MASTER BASE MANDATE
  sections.push(`[IDENTITY & PHOTO EDITING MANDATE]\n${PHOTO_PROMPTS.base}`);

  // [2] PHOTO FORMAT & FRAMING
  const sizePrompt = PHOTO_PROMPTS.sizes[sizeId] || PHOTO_PROMPTS.sizes.passport;
  sections.push(`[PHOTO FORMAT & FRAMING]\n${sizePrompt}`);

  // [3] BACKGROUND ILLUMINATION
  let bgPrompt = '';
  if (bgId === 'custom' && customBgHex) {
    bgPrompt = `Use a clean, uniform solid background in the selected color: ${customBgHex}.`;
  } else if (PHOTO_PROMPTS.backgrounds[bgId]) {
    bgPrompt = PHOTO_PROMPTS.backgrounds[bgId];
  } else {
    const bgObj = BG_COLORS.find(b => b.id === bgId);
    bgPrompt = bgObj 
      ? `Use a clean, uniform solid background in ${bgObj.label} (${bgObj.hex}).`
      : PHOTO_PROMPTS.backgrounds.white;
  }
  sections.push(`[BACKGROUND SPECIFICATION]\n${bgPrompt}\n${PHOTO_PROMPTS.backgroundCommon}`);

  // [4] CLOTHING / ATTIRE
  if (sizeId === 'dual') {
    const leftAttire = buildAttireDescription(leftDressId || 'none', leftDressCustomization, "the left person");
    const rightAttire = buildAttireDescription(rightDressId || 'none', rightDressCustomization, "the right person");
    sections.push(`[DUAL ATTIRE SPECIFICATION]\n- Left Person Attire: ${leftAttire}\n- Right Person Attire: ${rightAttire}`);
  } else {
    const singleAttire = buildAttireDescription(dressId, dressCustomization, "the person");
    sections.push(`[CLOTHING & ATTIRE]\n${singleAttire}`);
  }

  // [5] SELECTED FACIAL & STUDIO ENHANCEMENTS
  const activeEnhancements: string[] = [];
  if (enhancementIds && enhancementIds.length > 0) {
    for (const enhId of enhancementIds) {
      if (PHOTO_PROMPTS.enhancements[enhId]) {
        activeEnhancements.push(`- ${PHOTO_PROMPTS.enhancements[enhId]}`);
      } else {
        const enhObj = ENHANCEMENT_OPTIONS.find(e => e.id === enhId);
        if (enhObj?.promptDirective) {
          activeEnhancements.push(`- ${enhObj.promptDirective}`);
        }
      }
    }
  }

  if (activeEnhancements.length > 0) {
    sections.push(`[SELECTED STUDIO ENHANCEMENTS]\n${activeEnhancements.join('\n')}`);
  }

  // [6] CUSTOM USER INSTRUCTION (WITH IDENTITY SAFETY GUARD)
  if (customInstruction && customInstruction.trim().length > 0) {
    sections.push(`[ADDITIONAL USER INSTRUCTION]\n${customInstruction.trim()}\n\n*Rule: Follow this instruction strictly only when it does not conflict with preserving facial identity, natural anatomy, and realistic identification photo appearance.*`);
  }

  // [7] PRIORITY RULES & NEGATIVE CONSTRAINTS
  sections.push(`[PRIORITY RULES & NEGATIVE CONSTRAINTS]\n${PHOTO_PROMPTS.priorityAndNegative}`);

  return sections.join('\n\n');
}

