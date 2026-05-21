import { LeftSidebar } from './components/studio/LeftSidebar';
import { CenterPreview } from './components/studio/CenterPreview';
import { StudioProvider } from './context/StudioContext';
import { StudioHeader } from './components/studio/StudioHeader';
import { RightSidebar } from './components/studio/RightSidebar';

const App: React.FC = () => {
  return (
    <StudioProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <StudioHeader />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <CenterPreview />
          <RightSidebar />
        </div>
      </div>
    </StudioProvider>
  );
};

export default App;
