import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroMarquee } from './components/HeroMarquee';
import { GoalInputSection } from './components/GoalInputSection';
import { BomExtractorCard } from './components/BomExtractorCard';
import { PravaApprovalModal } from './components/PravaApprovalModal';
import { SplitScreenAgent } from './components/SplitScreenAgent';
import { HitlModal } from './components/HitlModal';
import { OrderConfirmation } from './components/OrderConfirmation';
import { PravaTrustBadge } from './components/PravaTrustBadge';

import { BomItem, BrowserTabState, MerchantName, PravaCard } from './types';
import { PRESET_SCENARIOS } from './data/presetScenarios';
import { OpenAiService } from './services/openaiService';
import { AutomationEngine } from './services/automationEngine';
import { PravaService } from './services/pravaService';
import { ApiClient } from './services/apiClient';

type AppStep = 'input' | 'bom_extracted' | 'agent_executing' | 'orders_completed';

export function App() {
  // State Machine
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('smart-mirror');
  const [goalId, setGoalId] = useState<string>('');
  
  // Audio FX toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Goal & BOM State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scenarioTitle, setScenarioTitle] = useState<string>('');
  const [scenarioDescription, setScenarioDescription] = useState<string>('');
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [suggestedLimit, setSuggestedLimit] = useState<number>(0);
  const [merchantCount, setMerchantCount] = useState<number>(0);

  // Prava Modal State
  const [isPravaModalOpen, setIsPravaModalOpen] = useState<boolean>(false);
  const [approvedLimit, setApprovedLimit] = useState<number>(0);
  const [pravaCards, setPravaCards] = useState<PravaCard[]>([]);

  // Browser Execution Engine State
  const [browserTabs, setBrowserTabs] = useState<BrowserTabState[]>([]);
  
  // HITL State
  const [isHitlOpen, setIsHitlOpen] = useState<boolean>(false);
  const [hitlMessage, setHitlMessage] = useState<string>('');

  // Audio Beep Synth Generator using Web Audio API
  const playSound = (freq = 600, type: OscillatorType = 'sine', duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context fallbacks
    }
  };

  // Analyze Goal Handler -> Calls Express API Backend + OpenAI gpt-4o + SQLite
  const handleAnalyzeGoal = async (input: string) => {
    playSound(784, 'triangle', 0.15);
    setIsAnalyzing(true);
    setCurrentStep('input');

    try {
      // Attempt backend API call first
      let data: any;
      try {
        data = await ApiClient.extractGoal(input);
      } catch (err) {
        console.warn('Backend API offline, using local service fallback', err);
        data = await OpenAiService.analyzeGoal(input);
      }

      setGoalId(data.goalId || `goal_${Date.now()}`);
      setScenarioTitle(data.scenarioTitle);
      setScenarioDescription(data.description);
      setBomItems(data.bomItems);
      setTotalAmount(data.totalAmount);
      setSuggestedLimit(data.suggestedLimit);
      setMerchantCount(data.merchantCount);
      setCurrentStep('bom_extracted');
      playSound(1046, 'sine', 0.2);
    } catch (error) {
      console.error('Goal analysis error', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Scenario Select
  const handleSelectScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    const scenario = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (scenario) {
      handleAnalyzeGoal(scenario.inputUrlOrPrompt);
    }
  };

  // Open Prava Approval Drawer
  const handleOpenPravaApproval = () => {
    playSound(880, 'sine', 0.15);
    setIsPravaModalOpen(true);
  };

  // Prava Approval Action -> Launch Parallel Agents
  const handleApproveAndExecute = (limit: number, generatedCards: PravaCard[]) => {
    playSound(1174, 'triangle', 0.3);
    setApprovedLimit(limit);
    setPravaCards(generatedCards);
    setIsPravaModalOpen(false);

    // Initialize multi-browser execution tabs
    const initialTabs = AutomationEngine.createTabsForMerchants(bomItems);
    setBrowserTabs(initialTabs);
    setCurrentStep('agent_executing');
  };

  // Trigger HITL Fallback
  const handleTriggerHitl = (message: string) => {
    playSound(440, 'sawtooth', 0.25);
    setHitlMessage(message);
    setIsHitlOpen(true);
  };

  // Resolve HITL Fallback
  const handleResolveHitl = () => {
    playSound(987, 'sine', 0.2);
    setIsHitlOpen(false);

    // Resume tab execution
    setBrowserTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.status === 'paused') {
          return {
            ...tab,
            status: 'running' as const,
            steps: tab.steps.map((s, idx) =>
              idx === tab.currentStepIndex ? { ...s, status: 'completed' as const } : s
            )
          };
        }
        return tab;
      })
    );
  };

  // Complete All Orders Handler -> Persist Orders & Prava Charges to SQLite
  const handleCompleteAllOrders = async () => {
    playSound(1318, 'sine', 0.4);

    // Save orders into SQLite DB
    const merchantGroups = bomItems.reduce((acc, item) => {
      if (!acc[item.merchant]) acc[item.merchant] = [];
      acc[item.merchant].push(item);
      return acc;
    }, {} as Record<MerchantName, BomItem[]>);

    for (const [merchant, items] of Object.entries(merchantGroups)) {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const card = pravaCards.find((c) => c.merchantName === merchant) || pravaCards[0];
      try {
        await ApiClient.createOrderReceipt(
          goalId || `goal_${Date.now()}`,
          merchant as MerchantName,
          subtotal,
          card ? card.cardId : 'prv_card_default'
        );
      } catch (e) {
        console.warn('Backend order receipt logging:', e);
      }
    }

    setCurrentStep('orders_completed');
  };

  // Reset Demo
  const handleReset = () => {
    playSound(523, 'sine', 0.15);
    setCurrentStep('input');
    setGoalId('');
    setBomItems([]);
    setBrowserTabs([]);
    setIsPravaModalOpen(false);
    setIsHitlOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Header Navigation */}
      <Navbar
        onReset={handleReset}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 space-y-8">
        
        {/* Hero Banner with Marquee Ribbon */}
        <HeroMarquee onExplorePresets={() => handleSelectScenario('smart-mirror')} />

        {/* Goal & Link Parser Bar */}
        <GoalInputSection
          onAnalyzeGoal={handleAnalyzeGoal}
          isAnalyzing={isAnalyzing}
          activeScenarioId={activeScenarioId}
        />

        {/* Step 1: Extracted BOM Overview */}
        {currentStep === 'bom_extracted' && (
          <BomExtractorCard
            scenarioTitle={scenarioTitle}
            description={scenarioDescription}
            bomItems={bomItems}
            totalAmount={totalAmount}
            suggestedLimit={suggestedLimit}
            merchantCount={merchantCount}
            onOpenPravaApproval={handleOpenPravaApproval}
          />
        )}

        {/* Step 2: Split Screen Parallel Browser Agent Workspace */}
        {currentStep === 'agent_executing' && (
          <SplitScreenAgent
            tabs={browserTabs}
            onUpdateTabs={setBrowserTabs}
            onTriggerHitl={handleTriggerHitl}
            onCompleteAllOrders={handleCompleteAllOrders}
          />
        )}

        {/* Step 3: Orders Completed & Confirmation Receipts */}
        {currentStep === 'orders_completed' && (
          <OrderConfirmation
            scenarioTitle={scenarioTitle}
            bomItems={bomItems}
            approvedLimit={approvedLimit}
            totalPaid={totalAmount}
            onReset={handleReset}
          />
        )}

        {/* Prava Security Trust Showcase */}
        <PravaTrustBadge />

      </main>

      {/* Prava Virtual Card Approval Drawer Modal */}
      <PravaApprovalModal
        isOpen={isPravaModalOpen}
        onClose={() => setIsPravaModalOpen(false)}
        merchants={Array.from(new Set(bomItems.map((i) => i.merchant)))}
        orderTotal={totalAmount}
        defaultLimit={suggestedLimit}
        onApproveAndExecute={handleApproveAndExecute}
      />

      {/* Human-In-The-Loop Exception Modal */}
      <HitlModal
        isOpen={isHitlOpen}
        message={hitlMessage}
        onResolve={handleResolveHitl}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CartBlanche (OmniCart). Live Full-Stack Express Server & Prava Virtual Card Engine (SQLite Persisted).</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>OpenAI gpt-4o API</span>
            <span>•</span>
            <span>Prava Virtual Card API</span>
            <span>•</span>
            <span>SQLite cartblanche.db</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
