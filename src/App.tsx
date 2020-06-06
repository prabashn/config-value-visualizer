import * as React from "react";
import "./styles.css";
import { IndexComponent, IndexComponentProps } from "./components";

interface AppState {
  indexProps: IndexComponentProps;
}

export class App extends React.Component<
  {},
  AppState
> {
  private readonly txtCmsIdRef = React.createRef<HTMLInputElement>();
  private readonly chkDisableCacheRef = React.createRef<HTMLInputElement>();
  private readonly chkFlattenArrays = React.createRef<HTMLInputElement>();
  private readonly chkAutoExpandScopes = React.createRef<HTMLInputElement>();
  private readonly chkShowPropertiesOnly = React.createRef<HTMLInputElement>();
  private readonly chkShowFlightConfigs = React.createRef<HTMLInputElement>();

  constructor(props: any) {
    super(props);

    var cmsIndexId = (new URL(window.location.href)).searchParams.get("id") || "BBUsYQa";

    this.state = { 
      indexProps: {
        useCache: true,
        flattenArrays: true,
        cmsIndexId, 
        autoExpandScopes: false,
        showPropertiesOnly: true,
        showFlightConfigs: false
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
          key={indexProps.cmsIndexId}
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
          <label>CMS Index ID: </label>
          <input type="text" ref={this.txtCmsIdRef} defaultValue={indexProps.cmsIndexId} />
        </div>
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
          <label>Show only properties: </label>
          <input type="checkbox" ref={this.chkShowPropertiesOnly} defaultChecked={indexProps.showPropertiesOnly} />
        </div>
        <div className="input">
          <label>Show flight configs: </label>
          <input type="checkbox" ref={this.chkShowFlightConfigs} defaultChecked={indexProps.showFlightConfigs} />
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
        cmsIndexId: this.txtCmsIdRef.current?.value as string,
        useCache: !(this.chkDisableCacheRef.current?.checked as boolean),
        flattenArrays: !!(this.chkFlattenArrays.current?.checked as boolean),
        autoExpandScopes: !!(this.chkAutoExpandScopes.current?.checked as boolean),
        showPropertiesOnly: !!(this.chkShowPropertiesOnly.current?.checked as boolean),
        showFlightConfigs: !!(this.chkShowFlightConfigs.current?.checked as boolean),
      }
    });
  };
}
