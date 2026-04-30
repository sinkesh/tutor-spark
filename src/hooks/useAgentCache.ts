import { useState, useCallback, useRef } from 'react';
import { resolveAgentId, getAgentDocuments, getAgentTopics, getAgentKnowledgeBase } from '@/config/services';

interface AgentInfo {
  agentId: string;
  agentName: string;
  agentType: string;
  documents?: any[];
  topics?: any[];
  knowledgeBase?: any;
  lastFetched?: Date;
}

interface AgentCache {
  [key: string]: AgentInfo;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAgentCache = () => {
  const cacheRef = useRef<AgentCache>({});
  const [isLoading, setIsLoading] = useState(false);
  // Use a state just for triggering re-renders when cache updates
  const [, setCacheVersion] = useState(0);

  const isCacheValid = useCallback((agentInfo: AgentInfo) => {
    if (!agentInfo.lastFetched) return false;
    return Date.now() - agentInfo.lastFetched.getTime() < CACHE_DURATION;
  }, []);

  const getCachedAgent = useCallback((subjectName: string) => {
    const cached = cacheRef.current[subjectName.toLowerCase()];
    if (cached && isCacheValid(cached)) {
      return cached;
    }
    return null;
  }, [isCacheValid]);

  const resolveAndCacheAgent = useCallback(async (subjectName: string, studentId?: string) => {
    const cacheKey = subjectName.toLowerCase();
    const cached = cacheRef.current[cacheKey];

    if (cached && isCacheValid(cached)) {
      console.log(`Using cached agent info for ${subjectName}`);
      return cached;
    }

    setIsLoading(true);

    try {
      console.log(`Resolving and caching agent info for ${subjectName}`);
      const agentId = await resolveAgentId(subjectName, studentId);

      if (!agentId) {
        console.warn(`No agent ID found for subject: ${subjectName}`);
        return null;
      }

      const agentInfo: AgentInfo = {
        agentId,
        agentName: subjectName,
        agentType: 'subject'
      };

      // Cache the basic agent info first
      cacheRef.current[cacheKey] = {
        ...agentInfo,
        lastFetched: new Date()
      };
      setCacheVersion(v => v + 1);

      // Optionally fetch additional data in background (only if endpoints are available)
      try {
        const [documents, topics, knowledgeBase] = await Promise.allSettled([
          getAgentDocuments(agentId).catch(() => null),
          getAgentTopics(agentId).catch(() => null),
          getAgentKnowledgeBase(agentId).catch(() => null)
        ]);

        const enhancedAgentInfo: AgentInfo = {
          ...agentInfo,
          documents: documents.status === 'fulfilled' && documents.value ? documents.value : undefined,
          topics: topics.status === 'fulfilled' && topics.value ? topics.value : undefined,
          knowledgeBase: knowledgeBase.status === 'fulfilled' && knowledgeBase.value ? knowledgeBase.value : undefined
        };

        cacheRef.current[cacheKey] = {
          ...enhancedAgentInfo,
          lastFetched: new Date()
        };
        setCacheVersion(v => v + 1);
        return enhancedAgentInfo;
      } catch (fetchError) {
        console.warn('Failed to fetch additional agent data, using basic info:', fetchError);
        return agentInfo;
      }
    } catch (error) {
      console.error(`Failed to resolve agent for ${subjectName}:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isCacheValid]);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setCacheVersion(v => v + 1);
  }, []);

  const invalidateCache = useCallback((subjectName: string) => {
    delete cacheRef.current[subjectName.toLowerCase()];
    setCacheVersion(v => v + 1);
  }, []);

  return {
    cache: cacheRef.current,
    isLoading,
    getCachedAgent,
    resolveAndCacheAgent,
    clearCache,
    invalidateCache,
    isCacheValid
  };
};
