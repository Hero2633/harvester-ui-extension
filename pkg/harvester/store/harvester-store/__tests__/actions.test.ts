import actions from '../actions';
import { NAMESPACE_FILTERS } from '@shell/store/prefs';

describe('harvester-store actions.loadCluster', () => {
  it('loads server prefs when NAMESPACE_FILTERS is not yet in rootState.prefs.data and passes rootGetters to updateNamespaces', async() => {
    const rootState: any = {
      managementReady: false,
      prefs:           { data: {} },
    };

    const rootGetters: any = {
      'management/schemaFor':                jest.fn().mockReturnValue(true),
      'harvester-common/getFeatureEnabled':  jest.fn().mockReturnValue(true),
      'prefs/get':                           jest.fn((key: string) => rootState.prefs.data[key] || {}),
    };

    const filteredNamespaces = [{ id: 'ybh' }];
    const getters: any = {
      schemaFor:       jest.fn().mockReturnValue(false),
      filterNamespace: jest.fn().mockReturnValue(filteredNamespaces),
    };

    const commit = jest.fn();
    const dispatch = jest.fn(async(action: string) => {
      if (action === 'management/find') {
        return { id: 'local' };
      }
      if (action === 'management/findAll') {
        return [{ metadata: { name: 'local' } }];
      }
      if (action === 'prefs/loadServerQueued') {
        rootState.prefs.data[NAMESPACE_FILTERS] = { 'local__%%__harvester': ['ns://ybh'] };
      }

      return [];
    });

    setTimeout(() => {
      rootState.managementReady = true;
    }, 50);

    await actions.loadCluster(
      {
        state: {},
        commit,
        dispatch,
        getters,
        rootGetters,
        rootState,
      },
      { id: 'local' }
    );

    expect(dispatch).toHaveBeenCalledWith('prefs/loadServerQueued', null, { root: true });
    expect(commit).toHaveBeenCalledWith(
      'updateNamespaces',
      {
        filters: ['ns://ybh'],
        all:     filteredNamespaces,
        getters: rootGetters,
      },
      { root: true }
    );
  });
});
