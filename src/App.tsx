import "./styles.css";

import * as React from "react";

import { IndexComponent, IndexComponentProps } from "./components";

import { ConfigRef } from "./models";
import { configRefKey } from "./helpers";

const defaultBuild = "latest";

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
    //var cmsIndexId = thisUrl.searchParams.get("id") || "BBUsYQa";
    const configRef: ConfigRef = {
      build: thisUrl.searchParams.get("build") || defaultBuild,
      appType: thisUrl.searchParams.get("appType") || "edgeChromium",
      experienceType: thisUrl.searchParams.get("experienceType") || "AppConfig",
      instanceId: thisUrl.searchParams.get("instanceId") || "default",
      sharedNs: thisUrl.searchParams.get("sharedNs") || ""
    };

    this.state = { 
      indexProps: {
        useCache: true,
        flattenArrays: true,
        //cmsIndexId, 
        configRef,
        autoExpandScopes: false,
        showPropertiesOnly: true,
        flightFilter: "no-flights"
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
          <input type="text" ref={this.txtBuildRef} defaultValue={indexProps.configRef.build} />
        </div>
        <div className="input">
          <label>App Type: </label>
          <input type="text" ref={this.txtAppTypeRef} defaultValue={indexProps.configRef.appType} />
          OR
          <input type="text" ref={this.txtSharedNsRef} defaultValue={indexProps.configRef.sharedNs} />
        </div>
        <div className="input">
          <label>Experience Type: </label>
          <input type="text" ref={this.txtExperienceTypeRef} defaultValue={indexProps.configRef.experienceType} />
        </div>
        <div className="input">
          <label>Instance ID: </label>
          <input type="text" ref={this.txtInstanceIdRef} defaultValue={indexProps.configRef.instanceId} />
        </div>
        {/* <div className="input">
          <label>CMS Index ID: </label>
          <input type="text" ref={this.txtCmsIdRef} defaultValue={indexProps.cmsIndexId} />
        </div> */}
        <div className="input">
          <label>Disable cache: </label>
          <input type="checkbox" ref={this.chkDisableCacheRef} defaultChecked={!indexProps.useCache} />
        </div>
        <div className="input">
          <label>Flatten arrays: </label>
          <input type="checkbox" ref={this.chkFlattenArrays} defaultChecked={indexProps.flattenArrays} />
        </div>
        <div className="input">
          <label>Auto expand scopes: </label>
          <input type="checkbox" ref={this.chkAutoExpandScopes} defaultChecked={indexProps.autoExpandScopes} />
        </div>
        <div className="input">
          <label>Show only config properties: </label>
          <input type="checkbox" ref={this.chkShowPropertiesOnly} defaultChecked={indexProps.showPropertiesOnly} />
        </div>
        <div className="input">
          <label>Show flight configs: </label>
          <select ref={this.ddlFlightFilter}>
            <option value="no-flights" selected>Exclude Flights</option>
            <option value="with-flights">Include Flights</option>
            <option value="only-flights">Only Flights</option>
          </select>
        </div>
        <div className="input">
          <label />
          <button onClick={this.onLoadConfigIndex}>Load</button>
        </div>
      </div>
    );
  }

  onLoadConfigIndex = () => {
    this.setState({
      indexProps: {
        //cmsIndexId: this.txtCmsIdRef.current?.value as string,
        configRef: {
          build: this.txtBuildRef.current?.value as string,
          appType: this.txtAppTypeRef.current?.value as string,
          sharedNs: this.txtSharedNsRef.current?.value as string,
          experienceType: this.txtExperienceTypeRef.current?.value as string,
          instanceId: this.txtInstanceIdRef.current?.value as string,
        },
        useCache: !(this.chkDisableCacheRef.current?.checked as boolean),
        flattenArrays: !!(this.chkFlattenArrays.current?.checked as boolean),
        autoExpandScopes: !!(this.chkAutoExpandScopes.current?.checked as boolean),
        showPropertiesOnly: !!(this.chkShowPropertiesOnly.current?.checked as boolean),
        flightFilter: this.ddlFlightFilter.current?.value as any
      }
    });
  };
}
