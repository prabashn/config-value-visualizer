import { ConfigRef } from "../models/ConfigRef";

export function configRefKey(configRef: ConfigRef, fileName?: string) {
    const prefix = configRef.sharedNs
        ? `shared/${configRef.sharedNs.toLowerCase()}/`
        : "";
    const suffix = fileName
        ? `/${fileName.toLowerCase()}`
        : "";        
    return `${prefix}${configRef.experienceType.toLowerCase()}/${configRef.instanceId.toLowerCase()}${suffix}`;
}

export function configRefToString(configRef: ConfigRef) {
    return `${configRef.appType || configRef.sharedNs}/${configRef.experienceType}/${configRef.instanceId}`;
}

export function isValidConfigRef(configRef: ConfigRef) {
    return configRef 
      && configRef.build
      && (configRef.appType || configRef.sharedNs)
      && configRef.experienceType
      && configRef.instanceId;
  }