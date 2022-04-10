import { Config, ConfigRef, IndexType, ScopedConfig } from "../models";
import { configRefKey, configRefToString, isValidConfigRef, memoizedFetchText } from "../helpers";

import { memoize } from "lodash-es";

export interface LoadedConfigs {
  index?: IndexType;
  configs: Array<ScopedConfig>;
}

export async function loadConfigsFromIndex(
  configRef: ConfigRef,
  useCache: boolean
): Promise<LoadedConfigs> {
  const index = await cachedDocumentFetch<IndexType>(
    configRef,
    "index.json",
    useCache
  );

  if (!index) {
    return { configs: [] };
  }

  const scopedConfigs = index && index.configs;
  if (!scopedConfigs || !scopedConfigs.length) {
    console.error(`No config entries for index: ${configRefToString(configRef)}`);
    return { configs: [] };
  }

  const configs = await Promise.all(
    scopedConfigs.map(async scopedConfig => {
      const configSrc = scopedConfig.src;
      return {
        scope: scopedConfig.targetScope,
        config: await cachedDocumentFetch<Config>(configRef, configSrc, useCache)
      } as ScopedConfig;
    })
  );

  return {
    index,
    configs
  };
}

const getFeatureManifest = memoize(
  async (configRef: ConfigRef) => {

    let buildNumber: string;

    // if alpha num is present assume alias
    if (configRef.build.match(/[a-z]/)) {
      const versionUrl = `https://assets.msn.com/bundles/v1/${configRef.appType}/${configRef.build}/v`;
      buildNumber = ((await memoizedFetchText(versionUrl)) || "").replace(/(^[\s]+|[\s]+$)/g, "");
    } else {
      buildNumber = configRef.build;
    }

    const manifestUrl = `https://assets.msn.com/periconfigs/feature-manifests/${configRef.appType.toLowerCase()}/${buildNumber}.json`
    const manifest = JSON.parse(await memoizedFetchText(manifestUrl) || "{}").fileHashes || {};
    return manifest as { [configFileKey: string]: string };

  },
  configRef => `${configRef.build}|${configRef.appType}|feature`
);

async function cachedDocumentFetch<T>(
  configRef: ConfigRef,
  configSrc: string,
  useCache: boolean
): Promise<T | undefined> {

  if (!isValidConfigRef(configRef)) {
    return;
  }

  const manifest = await getFeatureManifest(configRef);
  const manifestKey = configRefKey(configRef, configSrc);
  const hashedFileName = manifest[manifestKey];
  const hashedUrl = `https://assets.msn.com/periconfigs/feature-configs/${manifestKey}/${hashedFileName}`;
  let jsonString = await memoizedFetchText(hashedUrl) || "{}";
  let json = JSON.parse(jsonString) as T;
  return json;
}

