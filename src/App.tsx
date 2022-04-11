import "./styles.css";

import * as React from "react";

import { IndexComponent, IndexComponentProps } from "./components";

import { ConfigRef } from "./models";
import { configRefKey } from "./helpers";

const defaultBuild = "latest";
const defaultFlightFilter = "with-flights";

interface AppState {
  indexProps: IndexComponentProps;
}

export class App extends React.Component<
  {},
  AppState
> {
  //private readonly txtCmsIdRef = React.createRef<HTMLInputElement>();
  private readonly txtBuildRef = React.createRef<HTMLInputElement>();
  private readonly txtAppTypeRef = React.createRef<HTMLInputElement>();
  private readonly txtSharedNsRef = React.createRef<HTMLInputElement>();
  private readonly txtExperienceTypeRef = React.createRef<HTMLInputElement>();
  private readonly txtInstanceIdRef = React.createRef<HTMLInputElement>();
  
  private readonly chkDisableCacheRef = React.createRef<HTMLInputElement>();
  private readonly chkFlattenArrays = React.createRef<HTMLInputElement>();
  private readonly chkAutoExpandScopes = React.createRef<HTMLInputElement>();
  private readonly chkShowPropertiesOnly = React.createRef<HTMLInputElement>();
  private readonly ddlFlightFilter = React.createRef<HTMLSelectElement>();

  constructor(props: any) {
    super(props);

    const thisUrl = new URL(window.location.href);
    
    const configRef: ConfigRef = {
      build: thisUrl.searchParams.get("build") || defaultBuild,
      appType: thisUrl.searchParams.get("appType") || "edgeChromium",
      experienceType: thisUrl.searchParams.get("experienceType") || "AppConfig",
      instanceId: thisUrl.searchParams.get("instanceId") || "default",
      sharedNs: thisUrl.searchParams.get("sharedNs") || ""
    };

    const otherState = JSON.parse(sessionStorage.getItem("state") || JSON.stringify({
      useCache: true,
      flattenArrays: true,
      autoExpandScopes: false,
      showPropertiesOnly: true,
      flightFilter: defaultFlightFilter
    }));

    this.state = { 
      indexProps: {
        ...otherState,
        configRef
      }
    };
  }

  render(): React.ReactNode {
    const { indexProps } = this.state;
    return (
      <div className="app">
        <h1>CMS Config Visualizer</h1>
        {this.renderInputForm()}
        <IndexComponent
          key={configRefKey(indexProps.configRef)}
         // implicit properties passed in
          {...indexProps}
        />
      </div>
    );
  }

  renderInputForm(): React.ReactNode {
    const { indexProps } = this.state;
    return (
      <div className="app-input">
        <div className="input">
          <label>Build: </label>
          <input type="text" ref={this.txtBuildRef} defaultValue={indexProps.configRef.build} autoComplete="off" />
          <div className="tip">Case sensitive. i.e., latest, rolling, 20220101.1, etc.</div>
        </div>
        <div className="input">
          <label>App Type: </label>
          <input type="text" ref={this.txtAppTypeRef} defaultValue={indexProps.configRef.appType} autoComplete="off" /> OR
          <div className="tip">Case sensitive. i.e., edgeChromium, windowsShell<br/>Note: only one of app type or namespace is required.</div>
        </div>
        <div className="input">
          <label>Shared namespace: </label>
          <input type="text" ref={this.txtSharedNsRef} defaultValue={indexProps.configRef.sharedNs} autoComplete="off" />
          <div className="tip">Case sensitive. i.e., msn-ns<br/>Note: only one of app type or namespace is required.</div>
        </div>
        <div className="input">
          <label>Experience Type: </label>
          <input type="text" ref={this.txtExperienceTypeRef} defaultValue={indexProps.configRef.experienceType} autoComplete="off" />
          <div className="tip">Case sensitive. i.e., EntryPoint, EdgeChromiumPageWC, etc.</div>
        </div>
        <div className="input">
          <label>Instance ID: </label>
          <input type="text" ref={this.txtInstanceIdRef} defaultValue={indexProps.configRef.instanceId} autoComplete="off" />
          <div className="tip">Case sensitive. i.e., default</div>
        </div>
        {/* <div className="input">
          <label>CMS Index ID: </label>
          <input type="text" ref={this.txtCmsIdRef} defaultValue={indexProps.cmsIndexId} />
        </div> */}
        <div className="input" style={{ display: "none" }}>
          <label>Disable cache: </label>
          <input type="checkbox" ref={this.chkDisableCacheRef} defaultChecked={!indexProps.useCache} autoComplete="off" />
        </div>
        <div className="input">
          <label>Flatten arrays: </label>
          <input type="checkbox" ref={this.chkFlattenArrays} defaultChecked={indexProps.flattenArrays} autoComplete="off" />
          <div className="tip">Show the array content without using the index to disambiguate array entries.</div>
        </div>
        <div className="input">
          <label>Auto expand scopes: </label>
          <input type="checkbox" ref={this.chkAutoExpandScopes} defaultChecked={indexProps.autoExpandScopes} autoComplete="off" />
          <div className="tip">Expand all property details so they're visible immediately after loading.</div>
        </div>
        <div className="input" style={{ display: "none" }}>
          <label>Show only config properties: </label>
          <input type="checkbox" ref={this.chkShowPropertiesOnly} defaultChecked={indexProps.showPropertiesOnly} autoComplete="off" />
        </div>
        <div className="input">
          <label>Show flight configs: </label>
          <select ref={this.ddlFlightFilter} autoComplete="off">
            <option value="no-flights">Exclude Flights</option>
            <option value="with-flights">Include Flights</option>
            <option value="only-flights">Only Flights</option>
          </select>
          <div className="tip">Limit loading and displaying of configs based on flight affinity.</div>
        </div>
        <div className="input">
          <label />
          <button onClick={this.onLoadConfigIndex}>Load</button>
        </div>
      </div>
    );
  }

  public componentDidMount(): void {
    super.componentDidMount?.();
    
    const indexProps = this.state.indexProps;
    if (!indexProps) {
      return;
    }

    const ifDefined = function<T> (value: T | undefined, defaultValue: T): T { 
      return value !== undefined ? value : defaultValue; 
    }
    
    if (this.chkDisableCacheRef.current) {
      this.chkDisableCacheRef.current.checked = ifDefined(indexProps.useCache, false);
    }
    if (this.chkFlattenArrays.current) {
      this.chkFlattenArrays.current.checked = ifDefined(indexProps.flattenArrays, false);
    }
    if (this.chkAutoExpandScopes.current) {
      this.chkAutoExpandScopes.current.checked = ifDefined(indexProps.autoExpandScopes, false);
    }
    if (this.chkShowPropertiesOnly.current) {
      this.chkShowPropertiesOnly.current.checked = ifDefined(indexProps.showPropertiesOnly, false);
    }
    if (this.ddlFlightFilter.current) {
      this.ddlFlightFilter.current.value = ifDefined(indexProps.flightFilter, defaultFlightFilter);
    }
  }

  onLoadConfigIndex = () => {

    const configRef: any = {
      build: this.txtBuildRef.current?.value as string,
      appType: this.txtAppTypeRef.current?.value as string,
      sharedNs: this.txtSharedNsRef.current?.value as string,
      experienceType: this.txtExperienceTypeRef.current?.value as string,
      instanceId: this.txtInstanceIdRef.current?.value as string,
    };

    const otherState = {
      useCache: !(this.chkDisableCacheRef.current?.checked as boolean),
      flattenArrays: !!(this.chkFlattenArrays.current?.checked as boolean),
      autoExpandScopes: !!(this.chkAutoExpandScopes.current?.checked as boolean),
      showPropertiesOnly: !!(this.chkShowPropertiesOnly.current?.checked as boolean),
      flightFilter: this.ddlFlightFilter.current?.value as any
    };

    sessionStorage.setItem("state", JSON.stringify(otherState));

    const newState = {
      ...otherState,
      configRef
    }

    const qsps = Object.keys(configRef)
      .map(key => `${key}=${encodeURIComponent(configRef[key])}`)
      .join("&");

    const newUrl = new URL(window.location.href);

    // prevent unnecessary location replacement unless it's really changing
    if (newUrl.search !== qsps) {
      newUrl.search = qsps;
      window.location.href = newUrl.href;
    } else {
      // otherwise go through the internal react state update to re-render
      this.setState({ indexProps: { ...newState } });
    }
  };
}
