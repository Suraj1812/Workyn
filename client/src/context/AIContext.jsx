import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import aiService from '../services/aiService.js';
import { useAuth } from './AuthContext.jsx';

const AIContext = createContext(null);

const emptySummary = {
  pendingSuggestions: 0,
  activeAutomations: 0,
  reviewedSuggestions: 0,
};

export const AIProvider = ({ children }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshAi = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) {
        setSuggestions([]);
        setAutomations([]);
        setSummary(emptySummary);
        setLoading(false);
        setError('');
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const [overviewResponse, suggestionsResponse, automationsResponse] = await Promise.all([
          aiService.getOverview(),
          aiService.getSuggestions(),
          aiService.getAutomations(),
        ]);

        setSummary(overviewResponse.summary || emptySummary);
        setSuggestions(suggestionsResponse.suggestions || []);
        setAutomations(automationsResponse.automations || []);
        setError('');
      } catch (refreshError) {
        if (!silent) {
          setError(refreshError?.response?.data?.message || 'Unable to load AI insights.');
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [user],
  );

  useEffect(() => {
    refreshAi();

    if (!user) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      refreshAi({ silent: true });
    }, 45_000);

    return () => clearInterval(intervalId);
  }, [refreshAi, user]);

  const respondToSuggestion = useCallback(
    async (suggestionId, accepted) => {
      const response = await aiService.respondToSuggestion(suggestionId, accepted);
      await refreshAi({ silent: true });
      return response;
    },
    [refreshAi],
  );

  const toggleAutomation = useCallback(
    async (automationId, active) => {
      const response = await aiService.updateAutomation(automationId, { active });
      await refreshAi({ silent: true });
      return response;
    },
    [refreshAi],
  );

  const getModuleSuggestions = useCallback(
    (module) => suggestions.filter((suggestion) => suggestion.module === module),
    [suggestions],
  );

  const value = useMemo(
    () => ({
      suggestions,
      automations,
      summary,
      loading,
      error,
      refreshAi,
      respondToSuggestion,
      toggleAutomation,
      getModuleSuggestions,
    }),
    [
      suggestions,
      automations,
      summary,
      loading,
      error,
      refreshAi,
      respondToSuggestion,
      toggleAutomation,
      getModuleSuggestions,
    ],
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error('useAI must be used within AIProvider.');
  }

  return context;
};
