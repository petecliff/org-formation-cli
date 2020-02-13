import { CloudFormationBinder, ICfnBinding, ICfnSubValue } from '../../../src/cfn-binder/cfn-binder';
import { OrgResourceTypes } from '../../../src/parser/model/resource-types';
import { TemplateRoot } from '../../../src/parser/parser';
import { PersistedState } from '../../../src/state/persisted-state';
import { ICfnTemplate } from '../cfn-types';

describe('when resolving enum-expressions', () => {
    let template: TemplateRoot;
    let cloudformationBinder: CloudFormationBinder;
    let bindings: ICfnBinding[];
    let masterAccountTemplate: ICfnTemplate;

    beforeEach(() => {
        template = TemplateRoot.create('./test/resources/enum-expressions/enum-expressions.yml');
        const persistedState = PersistedState.CreateEmpty(template.organizationSection.masterAccount.accountId);

        persistedState.setBinding({type: OrgResourceTypes.MasterAccount, physicalId: '000000000000', logicalId: 'MasterAccount', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '111111111111', logicalId: 'Account1', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '222222222222', logicalId: 'Account2', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '333333333333', logicalId: 'Account3', lastCommittedHash: 'abc'});
        persistedState.setBinding({type: OrgResourceTypes.Account, physicalId: '444444444444', logicalId: 'Account4', lastCommittedHash: 'abc'});

        cloudformationBinder = new CloudFormationBinder('enum-expressions', template, persistedState);
        bindings = cloudformationBinder.enumBindings();
        masterAccountTemplate = JSON.parse(bindings.find((x) => x.accountId === '000000000000').template.createTemplateBody()) as ICfnTemplate;
    });

    test('can create cfn bindings for template', () => {
        expect(bindings).toBeDefined();
    });

    test('creates template for master account', () => {
        expect(masterAccountTemplate).toBeDefined();
        const resource = masterAccountTemplate.Resources.Resource;
        expect(Object.keys(resource)).not.toHaveLength(0);
    });

    test(
        'enum target for all accounts creates array with value for all accounts',
        () => {
            const resource = masterAccountTemplate.Resources.Resource;
            const val = resource.Properties.EnumAllTargetAccounts;
            expect(Array.isArray(val)).toBe(true);
            expect(val.length).toBe(4);
            expect(val[0]).toBe('blabla-111111111111-blabla');
            expect(val[3]).toBe('blabla-444444444444-blabla');
        }
    );

    test('enum target for OU1 creates string value for only 1', () => {
        const resource = masterAccountTemplate.Resources.Resource;
        const val = resource.Properties.EnumOU1TargetAccounts;
        expect(Array.isArray(val)).toBe(false);
        expect(val).toBe('blabla-111111111111-blabla');
    });

    test('enum regions for all creates array with value for each region', () => {
        const resource = masterAccountTemplate.Resources.Resource;
        const val = resource.Properties.EnumAllTargetRegions;
        expect(Array.isArray(val)).toBe(true);
        expect(val.length).toBe(2);
        expect(val[0]).toBe('blabla-eu-west-1-blabla');
        expect(val[1]).toBe('blabla-eu-central-1-blabla');
    });

    test('enum regions for ou1 creates string value for each region', () => {
        const resource = masterAccountTemplate.Resources.Resource;
        const val = resource.Properties.EnumOU1TargetRegions;
        expect(val).toBe('blabla-eu-west-1-blabla');
    });

    test(
        'enum accounts for results in Sub expression if variables are found',
        () => {
            const resource = masterAccountTemplate.Resources.Resource;
            const val: ICfnSubValue = resource.Properties.EnumWithOtherParameter;
            expect(val['Fn::Sub']).toBeDefined();
            expect(val['Fn::Sub']).toBe('blabla-111111111111-${something}-blabla');
        }
    );

    test('enum accounts can be used with default binding', () => {
        const resource = masterAccountTemplate.Resources.Resource;
        const val = resource.Properties.EnumWithDefaultAccountBinding;
        expect(val).toBe('blabla-222222222222-blabla');
    });

    test(
        'enum target for all accounts creates array with value for all accounts (single qoutes)',
        () => {
            const resource = masterAccountTemplate.Resources.Resource2;
            const val = resource.Properties.EnumAllTargetAccounts;
            expect(Array.isArray(val)).toBe(true);
            expect(val.length).toBe(4);
            expect(val[0]).toBe('blabla 111111111111 blabla');
            expect(val[3]).toBe('blabla 444444444444 blabla');
        }
    );

    test(
        'enum target for OU1 creates string value for only 1 (single qoutes)',
        () => {
            const resource = masterAccountTemplate.Resources.Resource2;
            const val = resource.Properties.EnumOU1TargetAccounts;
            expect(Array.isArray(val)).toBe(false);
            expect(val).toBe('blabla 111111111111 blabla');
        }
    );

    test(
        'enum regions for all creates array with value for each region (single qoutes)',
        () => {
            const resource = masterAccountTemplate.Resources.Resource2;
            const val = resource.Properties.EnumAllTargetRegions;
            expect(Array.isArray(val)).toBe(true);
            expect(val.length).toBe(2);
            expect(val[0]).toBe('blabla eu-west-1 blabla');
            expect(val[1]).toBe('blabla eu-central-1 blabla');
        }
    );

    test(
        'enum regions for ou1 creates string value for each region (single qoutes)',
        () => {
            const resource = masterAccountTemplate.Resources.Resource2;
            const val = resource.Properties.EnumOU1TargetRegions;
            expect(val).toBe('blabla eu-west-1 blabla');
        }
    );

    test(
        'enum accounts for results in Sub expression if variables are found (single qoutes)',
        () => {
            const resource = masterAccountTemplate.Resources.Resource2;
            const val: ICfnSubValue = resource.Properties.EnumWithOtherParameter;
            expect(val['Fn::Sub']).toBeDefined();
            expect(val['Fn::Sub']).toBe('blabla 111111111111 ${something} blabla');
        }
    );

    test('enum accounts can be used with default binding (single qoutes)', () => {
        const resource = masterAccountTemplate.Resources.Resource2;
        const val = resource.Properties.EnumWithDefaultAccountBinding;
        expect(val).toBe('blabla 222222222222 blabla');
    });
});
