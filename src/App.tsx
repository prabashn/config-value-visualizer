import * as React from "react";
import "./styles.css";
import { IndexComponent } from "./components";

export class App extends React.Component<
  {},
  { cmsIndexId?: string; useCache: boolean, flattenArrays: boolean }
> {
  private readonly txtCmsIdRef = React.createRef<HTMLInputElement>();
  private readonly chkDisableCacheRef = React.createRef<HTMLInputElement>();
  private readonly chkFlattenArrays = React.createRef<HTMLInputElement>();

  constructor(props: any) {
    super(props);
    this.state = { useCache: true, flattenArrays: true, cmsIndexId: "BBUsYQa" };
  }

  render(): React.ReactNode {
    const { cmsIndexId, useCache, flattenArrays } = this.state;
    return (
      <div className="app">
        <h1>CMS Config Visualizer</h1>
        {this.renderInputForm()}
        <IndexComponent
          key={cmsIndexId}
          cmsIndexId={cmsIndexId}
          useCache={useCache}
          flattenArrays={flattenArrays}
        />
      </div>
    );
  }

  renderInputForm(): React.ReactNode {
    return (
      <div className="app-input">
        <div className="input">
          <label>CMS Index ID: </label>
          <input type="text" ref={this.txtCmsIdRef} defaultValue={this.state.cmsIndexId} />
        </div>
        <div className="input">
          <label>Disable cache: </label>
          <input type="checkbox" ref={this.chkDisableCacheRef} defaultChecked={!this.state.useCache} />
        </div>{" "}
        <div className="input">
          <label>Flatten arrays: </label>
          <input type="checkbox" ref={this.chkFlattenArrays} defaultChecked={this.state.flattenArrays} />
        </div>{" "}
        <div className="input">
          <label />
          <button onClick={this.onLoadConfigIndex}>Load</button>
        </div>
      </div>
    );
  }

  onLoadConfigIndex = () => {
    this.setState({
      cmsIndexId: this.txtCmsIdRef.current?.value as string,
      useCache: !(this.chkDisableCacheRef.current?.checked as boolean),
      flattenArrays: !!(this.chkFlattenArrays.current?.checked as boolean)
    });
  };
}
