# ShafinBD Studio 📸

ShafinBD Studio is a high-end, professional-grade web application designed for photo studio workflows. It offers powerful, client-side image processing tools powered by AI and computer vision.

## 🌟 Key Features
- **Next-Gen Background Removal**: 
  - Standard AI removal.
  - SOTA (State of the Art) GrabCut AI for complex edges.
  - Specialized Human/Portrait segmentation.
- **AI Image Enhancement**: Upscale and clarify images using client-side AI modules.
- **Studio-Grade Filters**: Real-time adjustment for Brightness, Contrast, Saturation, Temperature, Hue, and Sharpness.
- **Smart Print Layouts**: One-click formatting for Passport photos, 3R, 4R, and other standard studio sizes.
- **Advanced Layer Engine**: Professional layer-based editing with non-destructive changes.
- **Zero-Server Processing**: All image processing happens in your browser for maximum privacy and speed.

## 🛠 Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **AI/ML**: MediaPipe (Google), OpenCV.js, ONNX Runtime
- **Styles**: Framer Motion, shadcn/ui

## 🚀 How to Deploy to Vercel

1. **Push to GitHub**: Make sure you have pushed all the latest files, especially the updated `index.html` and the `src` folder.
2. **Connect to Vercel**: Import the repository into your Vercel account.
3. **Configure Environment Variables**:
   - Go to `Settings` > `Environment Variables`.
   - Add `VITE_APP_TITLE` with the value `ShafinBD Studio`.
4. **Build Settings**:
   - Framework Preset: `Vite` (Vercel usually auto-detects this).
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Common Fix for Build Errors**:
   - If you see "Could not resolve /src/main.tsx", ensure your `index.html` script tag looks exactly like this: `<script type="module" src="/src/main.tsx"></script>` (with a leading slash, no dot).
   - Check that the `src` folder case matches exactly in GitHub (it should be lowercase `src`).
6. **Deploy**: Click "Deploy". Vercel will automatically handle the rest.

---
Developed by **ShafinBD Studio**.
