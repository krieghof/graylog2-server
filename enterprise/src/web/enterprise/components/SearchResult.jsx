import React from 'react';
import { isEqual } from 'lodash';

import Spinner from 'components/common/Spinner';
import { FieldList } from 'enterprise/components/sidebar';
import Query from 'enterprise/components/Query';
import SideBar from 'enterprise/components/sidebar/SideBar';

import connect from 'stores/connect';

import { FieldTypesStore } from 'enterprise/stores/FieldTypesStore';
import { SearchStore } from 'enterprise/stores/SearchStore';
import { CurrentViewStateStore } from 'enterprise/stores/CurrentViewStateStore';
import { SelectedFieldsStore } from 'enterprise/stores/SelectedFieldsStore';
import { ViewMetadataStore } from 'enterprise/stores/ViewMetadataStore';
import { WidgetStore } from 'enterprise/stores/WidgetStore';
import LoadingIndicator from 'components/common/LoadingIndicator';
import { SearchLoadingStateStore } from 'enterprise/stores/SearchLoadingStateStore';

const SearchLoadingIndicator = connect(
  ({ searchLoadingState }) => (searchLoadingState.isLoading && <LoadingIndicator text="Updating search results..." />),
  { searchLoadingState: SearchLoadingStateStore },
);

const ConnectedFieldList = connect(FieldList, { selectedFields: SelectedFieldsStore });
const ConnectedSideBar = connect(SideBar, { viewMetadata: ViewMetadataStore });
const QueryWithWidgets = connect(Query, { widgets: WidgetStore });

class SearchResult extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps, this.props);
  }

  render() {
    const props = this.props;
    const { queryId } = props;
    const { fieldTypes, searches, showMessages, viewState } = props;
    const { onToggleMessages } = props;

    if (!fieldTypes) {
      return <Spinner />;
    }

    const results = searches && searches.result;
    const widgetMapping = searches && searches.widgetMapping;

    const currentResults = results ? results.forId(queryId) : undefined;
    const allFields = fieldTypes.all;
    const queryFields = fieldTypes.queryFields.get(queryId, fieldTypes.all);
    const positions = viewState.state && viewState.state.widgetPositions;

    const content = currentResults ? (
      <QueryWithWidgets allFields={allFields}
                        fields={queryFields}
                        onToggleMessages={onToggleMessages}
                        queryId={queryId}
                        results={currentResults}
                        showMessages={showMessages}
                        positions={positions}
                        widgetMapping={widgetMapping}>
        <ConnectedSideBar queryId={queryId} results={currentResults}>
          <ConnectedFieldList allFields={fieldTypes.all}
                              fields={queryFields} />
        </ConnectedSideBar>
      </QueryWithWidgets>
    ) : <Spinner />;

    return (
      <React.Fragment>
        {content}
        <SearchLoadingIndicator />
      </React.Fragment>
    );
  }
}

export default connect(SearchResult, {
  fieldTypes: FieldTypesStore,
  searches: SearchStore,
  viewState: CurrentViewStateStore,
}, props => Object.assign({}, props, { searches: { result: props.searches.result, widgetMapping: props.searches.widgetMapping } }));
