# Spell Crafting System UI Improvements

Based on code analysis of the current spell crafting system, here are 6 key improvements to enhance user experience and prevent crashes:

## 1. **Real-time Spell Preview with Validation**
**Current Issue**: Users can't see what their spell will look like until after AI generation
**Improvement**: Add a live preview panel showing:
- Estimated mana cost, damage, and effects based on selected components
- Visual indicator of spell power/rarity
- Warning messages for invalid combinations
- Component synergy indicators

```tsx
// Add to SpellDesignStudioView
const [spellPreview, setSpellPreview] = useState<Partial<GeneratedSpellData>>();

const generatePreview = () => {
  // Calculate estimated values based on components
  const estimatedManaCost = selectedComponentIds.reduce((sum, id) => {
    const comp = availableComponents.find(c => c.id === id);
    return sum + (comp?.manaCost || 0);
  }, 5);
  
  setSpellPreview({
    manaCost: estimatedManaCost,
    damage: /* calculate based on components */,
    // ... other estimates
  });
};
```

## 2. **Enhanced Component Parameter Controls**
**Current Issue**: TODO comment shows missing input types for component parameters
**Improvement**: Implement complete parameter control system:

```tsx
// Complete the TODO in SpellDesignStudioView.tsx:329
{param.type === 'numberInput' && (
  <input 
    type="number" 
    min={param.min} 
    max={param.max}
    step={param.step}
    value={componentConfigs[id]?.[param.key] ?? param.defaultValue}
    onChange={e => handleParamChange(id, param.key, parseInt(e.target.value))}
    className="w-full p-2 bg-slate-600 border border-slate-500 rounded"
  />
)}
{param.type === 'dropdown' && (
  <select
    value={componentConfigs[id]?.[param.key] ?? param.defaultValue}
    onChange={e => handleParamChange(id, param.key, e.target.value)}
    className="w-full p-2 bg-slate-600 border border-slate-500 rounded"
  >
    {param.options?.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
)}
```

## 3. **Component Filtering and Search System**
**Current Issue**: No way to filter or search through components as collection grows
**Improvement**: Add comprehensive filtering:

```tsx
const [componentFilter, setComponentFilter] = useState({
  category: 'all',
  tier: 'all',
  element: 'all',
  searchText: ''
});

const filteredComponents = availableComponents.filter(comp => {
  if (componentFilter.category !== 'all' && comp.category !== componentFilter.category) return false;
  if (componentFilter.tier !== 'all' && comp.tier !== parseInt(componentFilter.tier)) return false;
  if (componentFilter.element !== 'all' && comp.element !== componentFilter.element) return false;
  if (componentFilter.searchText && !comp.name.toLowerCase().includes(componentFilter.searchText.toLowerCase())) return false;
  return true;
});
```

## 4. **Spell Cost Calculator with Resource Optimizer**
**Current Issue**: Players can't easily see total costs or optimize resource usage
**Improvement**: Add intelligent cost calculation panel:

```tsx
const SpellCostCalculator = ({ selectedComponents, manualResources, player }) => {
  const totalCosts = useMemo(() => {
    let goldCost = 0;
    let essenceCost = 0;
    let resourceCosts = [...manualResources];
    
    selectedComponents.forEach(compId => {
      const comp = availableComponents.find(c => c.id === compId);
      goldCost += comp?.usageGoldCost || 0;
      essenceCost += comp?.usageEssenceCost || 0;
      if (comp?.baseResourceCost) {
        resourceCosts = mergeResourceCosts(resourceCosts, comp.baseResourceCost);
      }
    });
    
    return { goldCost, essenceCost, resourceCosts };
  }, [selectedComponents, manualResources]);

  const canAfford = player.gold >= totalCosts.goldCost && 
                   player.essence >= totalCosts.essenceCost &&
                   totalCosts.resourceCosts.every(cost => 
                     (player.inventory[cost.itemId] || 0) >= cost.quantity
                   );

  return (
    <div className={`p-4 rounded-lg border ${canAfford ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
      <h3>Total Crafting Cost</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>Gold: {totalCosts.goldCost} ({player.gold})</div>
        <div>Essence: {totalCosts.essenceCost} ({player.essence})</div>
      </div>
      {/* Resource costs display */}
      {!canAfford && <p className="text-red-400">Insufficient resources!</p>}
    </div>
  );
};
```

## 5. **Spell Template System**
**Current Issue**: No way to save or reuse successful component combinations
**Improvement**: Add template saving and loading:

```tsx
interface SpellTemplate {
  id: string;
  name: string;
  description: string;
  componentIds: string[];
  componentConfigs: Record<string, Record<string, string | number>>;
  tags: TagName[];
  level: number;
}

const SpellTemplateManager = ({ onLoadTemplate }) => {
  const [savedTemplates, setSavedTemplates] = useState<SpellTemplate[]>([]);
  
  const saveCurrentAsTemplate = () => {
    const template: SpellTemplate = {
      id: `template-${Date.now()}`,
      name: spellName || 'Unnamed Template',
      description: spellDescription || 'No description',
      componentIds: selectedComponentIds,
      componentConfigs,
      tags: selectedTags,
      level: spellLevel
    };
    setSavedTemplates(prev => [...prev, template]);
  };

  return (
    <div className="p-4 bg-slate-700/50 rounded-md">
      <h3>Spell Templates</h3>
      <button onClick={saveCurrentAsTemplate}>Save Current as Template</button>
      <div className="grid gap-2 mt-2">
        {savedTemplates.map(template => (
          <button 
            key={template.id}
            onClick={() => onLoadTemplate(template)}
            className="text-left p-2 bg-slate-600 rounded hover:bg-slate-500"
          >
            <div className="font-medium">{template.name}</div>
            <div className="text-xs text-slate-400">{template.componentIds.length} components</div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

## 6. **Enhanced Error Handling and Validation**
**Current Issue**: Crashes occur when AI generates invalid spell data
**Improvement**: Add comprehensive client-side validation and error recovery:

```tsx
const validateSpellBeforeGeneration = (designData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check component compatibility
  const selectedComponents = designData.componentsUsed.map(cu => 
    availableComponents.find(c => c.id === cu.componentId)
  ).filter(Boolean);
  
  // Check for conflicting elements
  const elements = selectedComponents.map(c => c.element).filter(Boolean);
  const uniqueElements = [...new Set(elements)];
  if (uniqueElements.length > 2) {
    errors.push('Too many conflicting elements selected. Limit to 2 elements.');
  }
  
  // Check for component exclusions
  selectedComponents.forEach(comp => {
    if (comp.exclusiveWith?.some(excludeId => 
      designData.componentsUsed.some(cu => cu.componentId === excludeId)
    )) {
      errors.push(`${comp.name} conflicts with another selected component.`);
    }
  });
  
  // Check resource availability
  if (!canAffordResourceCost(player.inventory, designData.investedResources)) {
    errors.push('Insufficient resources for this design.');
  }
  
  return { isValid: errors.length === 0, errors };
};

// Add error boundary for AI generation failures
const handleSpellGenerationWithFallback = async (designData) => {
  try {
    return await onFinalizeDesign(designData);
  } catch (error) {
    console.error('Spell generation failed:', error);
    
    // Provide fallback spell based on components
    const fallbackSpell = generateFallbackSpell(designData);
    setModalContent({
      title: 'AI Generation Failed',
      message: `AI generation failed, but we created a basic spell from your components: ${fallbackSpell.name}`,
      type: 'warning'
    });
    
    return fallbackSpell;
  }
};
```

## Implementation Priority:
1. **Error Handling & Validation** (High - prevents crashes)
2. **Component Parameter Controls** (High - completes existing TODO)
3. **Real-time Preview** (Medium - improves UX significantly)
4. **Cost Calculator** (Medium - helps with resource management)
5. **Filtering System** (Low - quality of life improvement)
6. **Template System** (Low - advanced feature for power users)

## Additional Crash Prevention Measures:

```tsx
// Add to applyStatusEffect function
const applyStatusEffect = (targetId: 'player' | string, effect: SpellStatusEffect, sourceId: string) => {
  // Validate effect name before creating ActiveStatusEffect
  if (!AVAILABLE_STATUS_EFFECTS.includes(effect.name)) {
    console.warn(`Invalid status effect name: ${effect.name}. Skipping application.`);
    addLog('System', `Invalid status effect attempted. Spell may be corrupted.`, 'error');
    return;
  }
  
  const iconName = STATUS_EFFECT_ICONS[effect.name];
  if (!iconName) {
    console.warn(`No icon found for status effect: ${effect.name}`);
  }
  
  const newEffect: ActiveStatusEffect = {
    id: `effect-${Date.now()}-${Math.random()}`,
    name: effect.name,
    duration: effect.duration || 1,
    magnitude: effect.magnitude,
    sourceSpellId: sourceId,
    inflictedTurn: turn,
    iconName: iconName || 'Default' // Fallback to Default icon
  };
  
  // ... rest of function
};
``` 