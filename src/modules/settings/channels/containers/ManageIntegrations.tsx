import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { ManageIntegrations } from 'modules/settings/integrations/containers/common';
import { integrationsListParams } from 'modules/settings/integrations/containers/utils';
import { queries as integQueries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  EditChannelMutationResponse,
  EditChannelMutationVariables,
  IChannel
} from '../types';

type Props = {
  currentChannel: IChannel;
  queryParams: any;
};

type FinalProps = Props & EditChannelMutationResponse;

class ManageIntegrationsContainer extends React.Component<FinalProps, {}> {
  save = integrationIds => {
    const { currentChannel, editMutation } = this.props;

    editMutation({
      variables: {
        _id: currentChannel._id,
        name: currentChannel.name,
        integrationIds,
        memberIds: currentChannel.memberIds
      }
    })
      .then(() => {
        Alert.success('Successfully saved');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { currentChannel } = this.props;

    const updatedProps = {
      ...this.props,
      current: currentChannel,
      save: this.save
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, EditChannelMutationResponse, EditChannelMutationVariables>(
      gql(mutations.channelEdit),
      {
        name: 'editMutation',
        options: ({
          queryParams,
          currentChannel
        }: {
          queryParams: any;
          currentChannel: IChannel;
        }) => {
          return {
            refetchQueries: [
              {
                query: gql(integQueries.integrations),
                variables: {
                  channelId: currentChannel._id,
                  ...integrationsListParams(queryParams)
                }
              },
              {
                query: gql(queries.channelDetail),
                variables: { _id: currentChannel._id }
              },
              {
                query: gql(queries.integrationsCount),
                variables: { channelId: currentChannel._id }
              }
            ]
          };
        }
      }
    )
  )(ManageIntegrationsContainer)
);
