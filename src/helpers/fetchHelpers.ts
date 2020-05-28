import { ScopedConfig, IndexType, Config } from "../models";

export async function loadConfigsFromIndex(
  cmsIndexId: string,
  useCache: boolean
): Promise<Array<ScopedConfig>> {
  const index = await cachedDocumentFetch<IndexType>(
    cmsIndexId,
    "Index",
    useCache
  );

  if (!index) {
    return [];
  }

  const configRefs = index && index.configs;
  if (!configRefs || !configRefs.length) {
    console.error(`No config entries for index: ${cmsIndexId}`);
    return [];
  }

  return await Promise.all(
    configRefs.map(async configRef => {
      const configIdIndex = configRef.href.lastIndexOf("/");
      const configId = configRef.href.substr(configIdIndex + 1);
      return {
        scope: configRef.targetScope,
        config: await cachedDocumentFetch<Config>(configId, "Config", useCache)
      } as ScopedConfig;
    })
  );
}

async function cachedDocumentFetch<T>(
  docId: string,
  docType: string,
  useCache: boolean
): Promise<T | undefined> {
  if (!docId) {
    return;
  }

  // if json exists on storage, use that
  let json = useCache && localStorage.getItem(docId);

  // else try to fetch from network
  if (!json) {
    const response = await fetch(
      `https://assets.msn.com/config/v1/cms/api/amp/Document/${docId}`
    );

    if (!response) {
      console.error(`Invalid response while fetching ${docType}: ${docId}`);
      return;
    }

    json = await response.text();
    if (!json) {
      console.error(`Invalid json while fetching ${docType}: ${docId}`);
      return;
    }
  }

  localStorage.setItem(docId, json);
  return JSON.parse(json) as T;
}
