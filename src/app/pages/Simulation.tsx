import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, AreaChart, Area, BarChart, Bar,
} from "recharts";
import {
  Settings, Play, Pause, RotateCcw, Download, Eye, AlertTriangle,
  TrendingUp, TrendingDown, Info, Zap,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface SimulationState {
  age: number;
  education: string;
  hours_per_week: number;
  capital_gain: number;
  sex: string;
  race: string;
  occupation: string;
  marital_status: string;
}

interface PredictionResult {
  probability: number;
  prediction: string;
  confidence: string;
  shap_values: Array<{ feature: string; value: number; impact: string }>;
}

const educationLevels = [
  "Preschool", "1st-4th", "5th-6th", "7th-8th", "9th", "10th", "11th", "12th",
  "HS-grad", "Some-college", "Assoc-voc", "Assoc-acdm", "Bachelors", "Masters", "Prof-school", "Doctorate"
];

const occupations = [
  "Tech-support", "Craft-repair", "Other-service", "Sales", "Exec-managerial",
  "Prof-specialty", "Handlers-cleaners", "Machine-op-inspct", "Adm-clerical",
  "Farming-fishing", "Transport-moving", "Priv-house-serv", "Protective-serv",
  "Armed-Forces"
];

const maritalStatuses = [
  "Never-married", "Married-civ-spouse", "Divorced", "Separated", "Widowed", "Married-spouse-absent", "Married-AF-spouse"
];

export function Simulation() {
  const { datasetId, fileName } = useAppContext();
  const [simulationState, setSimulationState] = useState<SimulationState>({
    age: 35,
    education: "Bachelors",
    hours_per_week: 40,
    capital_gain: 0,
    sex: "Male",
    race: "White",
    occupation: "Prof-specialty",
    marital_status: "Never-married",
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<Array<{ state: SimulationState; result: PredictionResult; timestamp: number }>>([]);
  const [sensitivityData, setSensitivityData] = useState<any[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonState, setComparisonState] = useState<SimulationState | null>(null);

  useEffect(() => {
    if (autoSimulate) {
      const interval = setInterval(() => {
        runSimulation();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoSimulate, simulationState]);

  const runSimulation = async () => {
    setIsSimulating(true);
    
    // Simulate API call to backend
    setTimeout(() => {
      const mockPrediction: PredictionResult = {
        probability: calculateMockProbability(simulationState),
        prediction: "",
        confidence: "High",
        shap_values: generateMockSHAP(simulationState),
      };
      mockPrediction.prediction = mockPrediction.probability > 0.5 ? "Approved" : "Rejected";
      
      setPrediction(mockPrediction);
      
      const newEntry = {
        state: { ...simulationState },
        result: mockPrediction,
        timestamp: Date.now(),
      };
      
      setSimulationHistory(prev => [...prev.slice(-19), newEntry]);
      setIsSimulating(false);
    }, 800);
  };

  const calculateMockProbability = (state: SimulationState): number => {
    let probability = 0.3; // base probability
    
    // Age factor
    if (state.age >= 35 && state.age <= 55) probability += 0.2;
    else if (state.age < 25 || state.age > 65) probability -= 0.1;
    
    // Education factor
    const eduIndex = educationLevels.indexOf(state.education);
    if (eduIndex >= 12) probability += 0.25; // Masters+
    else if (eduIndex >= 9) probability += 0.15; // Bachelors
    else if (eduIndex < 8) probability -= 0.1;
    
    // Hours per week
    if (state.hours_per_week >= 40 && state.hours_per_week <= 50) probability += 0.1;
    else if (state.hours_per_week < 20) probability -= 0.15;
    
    // Capital gain
    probability += Math.min(state.capital_gain / 20000, 0.3);
    
    // Bias factors (for demonstration)
    if (state.sex === "Male") probability += 0.15;
    if (state.race === "White") probability += 0.1;
    if (state.race === "Black") probability -= 0.05;
    
    // Occupation
    if (state.occupation.includes("Exec") || state.occupation.includes("Prof")) probability += 0.15;
    
    return Math.max(0, Math.min(1, probability));
  };

  const generateMockSHAP = (state: SimulationState) => {
    return [
      { feature: "age", value: 0.08, impact: "positive" },
      { feature: "education", value: 0.12, impact: "positive" },
      { feature: "hours_per_week", value: 0.05, impact: "positive" },
      { feature: "capital_gain", value: state.capital_gain / 10000, impact: state.capital_gain > 0 ? "positive" : "neutral" },
      { feature: "sex", value: state.sex === "Male" ? 0.15 : -0.08, impact: state.sex === "Male" ? "positive" : "negative" },
      { feature: "race", value: state.race === "White" ? 0.10 : state.race === "Black" ? -0.05 : 0.02, impact: state.race === "White" ? "positive" : state.race === "Black" ? "negative" : "neutral" },
      { feature: "occupation", value: 0.07, impact: "positive" },
    ];
  };

  const runSensitivityAnalysis = async () => {
    const feature = "age";
    const data = [];
    
    for (let age = 18; age <= 70; age += 2) {
      const testState = { ...simulationState, age };
      const probability = calculateMockProbability(testState);
      
      data.push({
        age,
        probability,
        male: calculateMockProbability({ ...testState, sex: "Male" }),
        female: calculateMockProbability({ ...testState, sex: "Female" }),
      });
    }
    
    setSensitivityData(data);
  };

  const resetSimulation = () => {
    setSimulationState({
      age: 35,
      education: "Bachelors",
      hours_per_week: 40,
      capital_gain: 0,
      sex: "Male",
      race: "White",
      occupation: "Prof-specialty",
      marital_status: "Never-married",
    });
    setPrediction(null);
    setSimulationHistory([]);
    setSensitivityData([]);
    setComparisonMode(false);
    setComparisonState(null);
  };

  const generateCounterfactual = () => {
    if (!prediction) return;
    
    const currentState = { ...simulationState };
    const targetProbability = prediction.probability > 0.5 ? 0.45 : 0.55;
    let counterfactualState = { ...currentState };
    
    // Simple counterfactual logic
    if (prediction.probability > 0.5) {
      // To decrease probability
      if (counterfactualState.capital_gain > 5000) {
        counterfactualState.capital_gain = Math.max(0, counterfactualState.capital_gain - 5000);
      } else if (counterfactualState.hours_per_week > 30) {
        counterfactualState.hours_per_week -= 10;
      } else {
        const eduIndex = educationLevels.indexOf(counterfactualState.education);
        if (eduIndex > 8) {
          counterfactualState.education = educationLevels[eduIndex - 2];
        }
      }
    } else {
      // To increase probability
      if (counterfactualState.capital_gain < 10000) {
        counterfactualState.capital_gain = Math.min(20000, counterfactualState.capital_gain + 5000);
      } else if (counterfactualState.hours_per_week < 50) {
        counterfactualState.hours_per_week += 10;
      } else {
        const eduIndex = educationLevels.indexOf(counterfactualState.education);
        if (eduIndex < educationLevels.length - 2) {
          counterfactualState.education = educationLevels[eduIndex + 2];
        }
      }
    }
    
    setComparisonMode(true);
    setComparisonState(counterfactualState);
  };

  if (!datasetId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl text-white mb-4">Simulation & Counterfactual Analysis</h1>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Please upload a dataset in the Dataset Analysis tab first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-white">Simulation & Counterfactual Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">
          Interactive simulation to understand model behavior and generate counterfactual explanations
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">Simulation Controls</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                autoSimulate ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {autoSimulate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {autoSimulate ? "Auto Simulating" : "Start Auto"}
            </button>
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Input Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Age</label>
              <input
                type="range"
                min="18"
                max="70"
                value={simulationState.age}
                onChange={(e) => setSimulationState(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>18</span>
                <span className="text-white">{simulationState.age}</span>
                <span>70</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Education</label>
              <select
                value={simulationState.education}
                onChange={(e) => setSimulationState(prev => ({ ...prev, education: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
              >
                {educationLevels.map(edu => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hours/Week</label>
              <input
                type="range"
                min="1"
                max="80"
                value={simulationState.hours_per_week}
                onChange={(e) => setSimulationState(prev => ({ ...prev, hours_per_week: parseInt(e.target.value) }))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span className="text-white">{simulationState.hours_per_week}</span>
                <span>80</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Capital Gain ($)</label>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={simulationState.capital_gain}
                onChange={(e) => setSimulationState(prev => ({ ...prev, capital_gain: parseInt(e.target.value) }))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span className="text-white">${simulationState.capital_gain.toLocaleString()}</span>
                <span>$50k</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sex</label>
              <div className="flex gap-2">
                {["Male", "Female"].map(sex => (
                  <button
                    key={sex}
                    onClick={() => setSimulationState(prev => ({ ...prev, sex }))}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      simulationState.sex === sex ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Race</label>
              <select
                value={simulationState.race}
                onChange={(e) => setSimulationState(prev => ({ ...prev, race: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
              >
                <option value="White">White</option>
                <option value="Black">Black</option>
                <option value="Asian">Asian</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Occupation</label>
              <select
                value={simulationState.occupation}
                onChange={(e) => setSimulationState(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
              >
                {occupations.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Marital Status</label>
              <select
                value={simulationState.marital_status}
                onChange={(e) => setSimulationState(prev => ({ ...prev, marital_status: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none"
              >
                {maritalStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-800">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </button>
          
          <button
            onClick={runSensitivityAnalysis}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Sensitivity Analysis
          </button>
          
          <button
            onClick={generateCounterfactual}
            disabled={!prediction}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            Generate Counterfactual
          </button>
        </div>
      </div>

      {/* Prediction Result */}
      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white mb-4">Prediction Result</h2>
            <div className="space-y-4">
              <div className={`text-center p-6 rounded-xl border ${
                prediction.prediction === "Approved" 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <p className={`text-3xl font-bold mb-2 ${
                  prediction.prediction === "Approved" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {prediction.prediction}
                </p>
                <p className="text-gray-400 text-sm mb-1">Probability: {(prediction.probability * 100).toFixed(1)}%</p>
                <p className="text-gray-500 text-xs">Confidence: {prediction.confidence}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-3">Feature Contributions (SHAP)</p>
                <div className="space-y-2">
                  {prediction.shap_values.map((shap, i) => (
                    <div key={shap.feature} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{shap.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              shap.impact === "positive" ? "bg-emerald-500" : 
                              shap.impact === "negative" ? "bg-red-500" : "bg-gray-600"
                            }`}
                            style={{ width: `${Math.abs(shap.value) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs ${
                          shap.impact === "positive" ? "text-emerald-400" : 
                          shap.impact === "negative" ? "text-red-400" : "text-gray-500"
                        }`}>
                          {shap.value > 0 ? "+" : ""}{shap.value.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Mode */}
          {comparisonMode && comparisonState && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white mb-4">Counterfactual Comparison</h2>
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-amber-300 text-sm">Minimal changes to flip prediction</p>
                </div>
                
                <div className="space-y-2">
                  {Object.keys(comparisonState).map(key => {
                    const original = simulationState[key as keyof SimulationState];
                    const changed = comparisonState[key as keyof SimulationState];
                    if (original !== changed) {
                      return (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{String(original)}</span>
                            <span className="text-amber-400">→</span>
                            <span className="text-amber-300">{String(changed)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <div className="pt-3 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Resulting probability:</span>
                    <span className="text-amber-400 text-sm font-bold">
                      {(calculateMockProbability(comparisonState) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sensitivity Analysis */}
      {sensitivityData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white mb-4">Age Sensitivity Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensitivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="age" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Probability"]} />
              <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Decision Threshold", fill: "#f59e0b", fontSize: 11 }} />
              <Line type="monotone" dataKey="male" stroke="#3b82f6" strokeWidth={2} name="Male" />
              <Line type="monotone" dataKey="female" stroke="#ec4899" strokeWidth={2} name="Female" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="probability" stroke="#8b5cf6" strokeWidth={2} name="Current Profile" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-400 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-blue-500" /> Male</div>
            <div className="flex items-center gap-1.5"><div className="w-6 border-b-2 border-dashed border-pink-500" /> Female</div>
            <div className="flex items-center gap-1.5"><div className="w-6 h-0.5 bg-violet-500" /> Current</div>
          </div>
        </div>
      )}

      {/* Simulation History */}
      {simulationHistory.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white mb-4">Simulation History</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={simulationHistory.map((entry, i) => ({ index: i + 1, probability: entry.result.probability }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="index" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }} itemStyle={{ color: "#d1d5db" }} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Probability"]} />
              <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="probability" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
