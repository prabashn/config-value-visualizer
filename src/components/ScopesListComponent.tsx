import * as React from 'react';

import { ScopedConfigDiff, scopedConfigComparer } from '../models/CompareList';

import { ScopedConfig } from '../models';

export interface ScopesListComponentProps<T extends ScopedConfig> {
	scopedItems: Array<T>;
	canBeRemovedCheck?: (scopedValue: T) => boolean;
	autoExpandScopes?: boolean;
}

export interface ScopesListComponentState {
	/**
   * for storing and comparing incoming props to previous props to see
   * if we're about to re-render due to a prop change
   */
	prevProps?: ScopesListComponentProps<any>;
	scopeVisibility: boolean | null;
	configDiff?: ScopedConfigDiff | null;
}

export class ScopesListComponent<T extends ScopedConfig> extends React.Component<
	ScopesListComponentProps<T>,
	ScopesListComponentState
> {
	constructor(props: ScopesListComponentProps<T>) {
		super(props);

		this.state = {
			prevProps: this.props,
			scopeVisibility: !!this.props.autoExpandScopes
		};
	}

	static getDerivedStateFromProps(
		props: ScopesListComponentProps<any>,
		state: ScopesListComponentState
	): ScopesListComponentState | null {
		// if we detect that the new props are different from the previously stored
		// props in state, that means props have been changed by parent, and we're going to re-render.
		// In this case, we want to make sure we use the props value for scope visibility.
		if (props !== state.prevProps) {
			return {
				prevProps: props,
				configDiff: null,
				scopeVisibility: !!props.autoExpandScopes
			};
		}

		// otherwise, use the values already in state -- no overrides needed
		return null;
	}

	render(): React.ReactNode {
		const { scopedItems, canBeRemovedCheck } = this.props;
		const { scopeVisibility } = this.state;

		if (!scopeVisibility) {
			return (
				<React.Fragment>
					{this.renderButtons(true, scopedItems.length)}
					{this.renderScopeDiff()}
				</React.Fragment>
			);
		}

		return (
			<React.Fragment>
				{this.renderButtons(false, scopedItems.length)}
				{this.renderScopeList(scopedItems, canBeRemovedCheck)}
				{this.renderScopeDiff()}
			</React.Fragment>
		);
	}

	private renderButtons(isShowMode: boolean, scopesCount: number): React.ReactNode {
		return (
			<React.Fragment>
				<input
					type="button"
					value={`${isShowMode ? 'Show' : ' Hide'} scopes (${scopesCount})`}
					onClick={this.toggleScopes}
				/>
				<input type="button" value="Diff source" onClick={this.compare1} />
				<input type="button" value="Diff target" onClick={this.compare2} />
			</React.Fragment>
		);
	}

	renderScopeList(
		scopedItems: Array<T>,
		canBeRemovedCheck?: (scopedValue: T) => boolean,
		color?: string
	) {
		return (
			<ul style={{ color }}>
				{scopedItems.map((scopedItem, index) => {
					const scopeHref = scopedItem.config && scopedItem.config._id;

					const scopeAnchor = scopeHref ? (
						<React.Fragment>
							(
							<a
								href={`https://www.msncms.microsoft.com/amp/document/${scopeHref}?mode=json`}
								target="_new"
							>
								{scopeHref}
							</a>
							)
						</React.Fragment>
					) : null;

					const canBeRemoved = canBeRemovedCheck && canBeRemovedCheck(scopedItem);

					return (
						<li key={index} className={canBeRemoved ? 'removable-scope' : ''}>
							<span className="scope">{JSON.stringify(scopedItem.scope || 'default')}</span>
							{scopeAnchor}
							{canBeRemoved && <span className="redundant"> Redundant</span>}
						</li>
					);
				})}
			</ul>
		);
	}

	renderScopeDiff(): React.ReactNode {
		const { configDiff } = this.state;
		if (!configDiff) {
			return null;
		}

		const hasFirst = configDiff.firstOnly.length;
		const hasSecond = configDiff.secondOnly.length;

		return (
			<div className="diff">
				{(!hasFirst && !hasSecond && <div>No difference</div>) || null}
				{(hasFirst && <div>Not present in:</div>) || null}
				{this.renderScopeList(configDiff.firstOnly as T[], undefined, 'red')}
				{(hasSecond && <div>Unique to this:</div>) || null}
				{this.renderScopeList(configDiff.secondOnly as T[], undefined, 'green')}
				{/* Intersection:
        {this.renderScopeList(configDiff.intersection, null, "blue")} */}
			</div>
		);
	}

	private toggleScopes = (): void => {
		this.setState({
			...this.state,
			scopeVisibility: !this.state.scopeVisibility
		});
	};

	private compare1 = (): void => {
		scopedConfigComparer.setConfigs(this.props.scopedItems, 1);
	};

	private compare2 = (): void => {
		scopedConfigComparer.setConfigs(this.props.scopedItems, 2);
		this.showDiff();
	};

	private showDiff(): void {
		const diff = scopedConfigComparer.getDiff();
		if (!diff) {
			return;
		}

		this.setState({
			...this.state,
			configDiff: diff
		});
	}
}

export class PropertyScopesListComponent extends ScopesListComponent<ScopedConfig> {}
