import SectionCard from '../SectionCard.jsx';
import AISuggestionList from './AISuggestionList.jsx';
import { useAI } from '../../context/AIContext.jsx';

const AIModuleSuggestions = ({
  module,
  title = 'AI suggestions',
  subtitle = 'Pattern-based hints from your recent activity',
}) => {
  const { getModuleSuggestions, respondToSuggestion } = useAI();
  const suggestions = getModuleSuggestions(module).slice(0, 2);

  if (!suggestions.length) {
    return null;
  }

  return (
    <SectionCard title={title} subtitle={subtitle} sx={{ mb: 3 }}>
      <AISuggestionList
        suggestions={suggestions}
        compact
        onAccept={(suggestionId) => respondToSuggestion(suggestionId, true)}
        onReject={(suggestionId) => respondToSuggestion(suggestionId, false)}
      />
    </SectionCard>
  );
};

export default AIModuleSuggestions;
