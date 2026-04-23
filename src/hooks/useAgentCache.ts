import { useState, useCallback, useEffect } from 'react';
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
  const [cache, setCache] = useState<AgentCache>({});
  const [isLoading, setIsLoading] = useState(false);

  const isCacheValid = useCallback((agentInfo: AgentInfo) => {
    if (!agentInfo.lastFetched) return false;
    return Date.now() - agentInfo.lastFetched.getTime() < CACHE_DURATION;
  }, []);

  const getCachedAgent = useCallback((subjectName: string) => {
    const cached = cache[subjectName.toLowerCase()];
    if (cached && isCacheValid(cached)) {
      return cached;
    }
    return null;
  }, [cache, isCacheValid]);

  const cacheAgent = useCallback((subjectName: string, agentInfo: AgentInfo) => {
    setCache(prev => ({
      ...prev,
      [subjectName.toLowerCase()]: {
        ...agentInfo,
        lastFetched: new Date()
      }
    }));
  }, []);

  const resolveAndCacheAgent = useCallback(async (subjectName: string, studentId?: string) => {
    const cacheKey = subjectName.toLowerCase();
    const cached = getCachedAgent(subjectName);
    
    if (cached) {
      console.log(`Using cached agent info for ${subjectName}`);
      return cached;
    }

    setIsLoading(true);
    
    try {
      console.log(`Resolving and caching agent info for ${subjectName}`);
      const agentId = await resolveAgentId(subjectName, studentId);
      
      if (!agentId) {
        console.warn(`No agent ID found for subject: ${subjectName}`);
        // Don't throw error, return null to allow fallback handling
        return null;
      }

      const agentInfo: AgentInfo = {
        agentId,
        agentName: subjectName,
        agentType: 'subject'
      };

      // Cache the basic agent info first
      cacheAgent(subjectName, agentInfo);

      // Optionally fetch additional data in background (only if endpoints are available)
      try {
        const [documents, topics, knowledgeBase] = await Promise.allSettled([
          getAgentDocuments(agentId).catch(() => null), // Don't fail if endpoint doesn't exist
          getAgentTopics(agentId).catch(() => null), // Don't fail if endpoint doesn't exist
          getAgentKnowledgeBase(agentId).catch(() => null) // Don't fail if endpoint doesn't exist
        ]);

        const enhancedAgentInfo: AgentInfo = {
          ...agentInfo,
          documents: documents.status === 'fulfilled' && documents.value ? documents.value : undefined,
          topics: topics.status === 'fulfilled' && topics.value ? topics.value : undefined,
          knowledgeBase: knowledgeBase.status === 'fulfilled' && knowledgeBase.value ? knowledgeBase.value : undefined
        };

        cacheAgent(subjectName, enhancedAgentInfo);
        return enhancedAgentInfo;
      } catch (fetchError) {
        console.warn('Failed to fetch additional agent data, using basic info:', fetchError);
        cacheAgent(subjectName, agentInfo);
        return agentInfo;
      }
    } catch (error) {
      console.error(`Failed to resolve agent for ${subjectName}:`, error);
      // Return null instead of throwing to allow graceful fallback
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedAgent, cacheAgent]);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  const invalidateCache = useCallback((subjectName: string) => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[subjectName.toLowerCase()];
      return newCache;
    });
  }, []);

  return {
    cache,
    isLoading,
    getCachedAgent,
    resolveAndCacheAgent,
    clearCache,
    invalidateCache,
    isCacheValid
  };
};
