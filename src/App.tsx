import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { WebLayout } from './components/web/WebLayout';
import { ToastContainer } from './components/common/ToastContainer';

// Web Role Views
import { PrincipalView } from './components/web/roles/PrincipalView';
import { VicePrincipalView } from './components/web/roles/VicePrincipalView';
import { TeacherWebView } from './components/web/roles/TeacherWebView';
import { AccountantView } from './components/web/roles/AccountantView';
import { ReceptionistView } from './components/web/roles/ReceptionistView';
import { HRView } from './components/web/roles/HRView';
import { LibrarianView } from './components/web/roles/LibrarianView';
import { TransportView } from './components/web/roles/TransportView';
import { ExamCoordinatorView } from './components/web/roles/ExamCoordinatorView';
import { ProfilePage } from './components/common/ProfilePage';

// Mobile Views
import { MobileLayout } from './components/mobile/MobileLayout';
import { MobileTeacherView } from './components/mobile/MobileTeacherView';
import { MobileParentView } from './components/mobile/MobileParentView';

// Icons for Mobile Tabs
import {
  Home,
  Layers,
  CheckSquare,
  ListTodo,
  MoreHorizontal,
  BookOpen,
  DollarSign,
  Bell,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { state, setActiveNav, setPlatform } = useApp();
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('schlar_demo_entered');
  });

  // Mobile Bottom Tab State
  const [mobileTab, setMobileTab] = useState('home');

  if (showWelcome) {
    return (
      <WelcomeScreen
        onEnter={() => {
          sessionStorage.setItem('schlar_demo_entered', 'true');
          setShowWelcome(false);
        }}
      />
    );
  }

  // 1. Mobile Experience (Critical: Parents have ONLY the mobile app experience - NO Parent Web Portal)
  const isParent = state.currentRole === 'parent';
  const isMobile = state.currentPlatform === 'mobile' || isParent;

  if (isMobile) {
    const teacherTabs = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'classes', label: 'Classes', icon: Layers },
      { id: 'attendance', label: 'Attendance', icon: CheckSquare },
      { id: 'tasks', label: 'Tasks', icon: ListTodo },
      { id: 'more', label: 'More', icon: MoreHorizontal },
    ];

    // Authoritative 5 destinations for Parent Mobile: Home, Attendance, Academics, Fees, More
    const parentTabs = [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'attendance', label: 'Attendance', icon: CheckSquare },
      { id: 'academics', label: 'Academics', icon: BookOpen },
      { id: 'fees', label: 'Fees', icon: DollarSign },
      { id: 'more', label: 'More', icon: MoreHorizontal },
    ];

    const isTeacher = state.currentRole === 'teacher';

    return (
      <MobileLayout
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        onExitToWelcome={() => setShowWelcome(true)}
        tabs={isTeacher ? teacherTabs : parentTabs}
      >
        {isTeacher ? (
          <MobileTeacherView
            activeTab={mobileTab}
            onTabChange={setMobileTab}
            onExit={() => setShowWelcome(true)}
          />
        ) : (
          <MobileParentView
            activeTab={mobileTab}
            onTabChange={setMobileTab}
            onExit={() => setShowWelcome(true)}
          />
        )}
      </MobileLayout>
    );
  }

  // 2. Web Experience
  const renderWebRoleView = () => {
    if (state.activeNav === 'profile') {
      return <ProfilePage onBack={() => setActiveNav('dashboard')} />;
    }

    switch (state.currentRole) {
      case 'admin':
      case 'principal':
        return <PrincipalView />;
      case 'vice_principal':
        return <VicePrincipalView />;
      case 'teacher':
        return <TeacherWebView />;
      case 'accountant':
        return <AccountantView />;
      case 'receptionist':
        return <ReceptionistView />;
      case 'hr':
        return <HRView />;
      case 'librarian':
        return <LibrarianView />;
      case 'transport':
        return <TransportView />;
      case 'exam_coordinator':
        return <ExamCoordinatorView />;
      case 'parent':
        // Parent must have a mobile/app workspace only. Never render a web portal.
        setPlatform('mobile');
        return null;
      default:
        return <PrincipalView />;
    }
  };

  return (
    <WebLayout onExitToWelcome={() => setShowWelcome(true)}>
      {renderWebRoleView()}
    </WebLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
      <ToastContainer />
    </AppProvider>
  );
}
