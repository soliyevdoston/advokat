import React from 'react';
import CaseNavigatorWizard from '../components/caseNavigator/CaseNavigatorWizard';

export default function CaseNavigatorPage() {
  return (
    <div className="min-h-screen pt-24 pb-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <CaseNavigatorWizard mode="page" />
    </div>
  );
}
