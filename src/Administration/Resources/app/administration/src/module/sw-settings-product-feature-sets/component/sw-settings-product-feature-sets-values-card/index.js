import template from './sw-settings-product-feature-sets-values-card.html.twig';
import './sw-settings-product-feature-sets-values-card.scss';

const { Component } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('sw-settings-product-feature-sets-values-card', {
    template,

    inject: ['repositoryFactory'],

    props: {
        productFeatureSet: {
            type: Object,
            required: true
        },
        isLoading: {
            type: Boolean,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data() {
        return {
            valuesLoading: false,
            cardLoading: false,
            values: [],
            selection: null,
            deleteButtonDisabled: true,
            term: '',
            showModal: false,
            currentValue: null
        };
    },

    computed: {
        productFeatureSetRepository() {
            return this.repositoryFactory.create('product_feature_set');
        },

        valuesEmpty() {
            return this.values.length === 0;
        },

        valuesCardClasses() {
            return {
                'is--empty': this.valuesEmpty
            };
        },

        productFeatureSetCriteria() {
            const criteria = new Criteria();
            criteria.addFilter(Criteria.equals('product_feature_set.id', this.productFeatureSet.id));

            return criteria;
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.getList();
        },

        onAddField() {
            this.onShowFeatureModal();
        },

        onGridSelectionChanged(selection, selectionCount) {
            this.selection = selection;
            this.deleteButtonDisabled = selectionCount <= 0;
        },

        onSearch() {
            if (!this.term) {
                this.getList();
            }

            this.values = this.productFeatureSet.features.filter((item) => {
                return item.name.match(this.term) || item.type.match(this.term);
            });
        },

        getList() {
            this.valuesLoading = true;
            this.values = [];

            if (this.productFeatureSet.features) {
                this.values = this.productFeatureSet.features;

                if (this.term) {
                    this.onSearch();
                }
            }

            this.valuesLoading = false;
        },

        onModalClose() {
            this.showModal = false;
            this.currentValue = null;
            this.$nextTick(() => this.getList());
        },

        onShowFeatureModal() {
            this.showModal = true;
        },

        onDeleteFields() {
            if (this.selection) {
                const deletedKeys = Object.keys(this.selection);

                this.productFeatureSet.features = this.productFeatureSet.features.filter((feature) => {
                    return !deletedKeys.includes(feature.id);
                });

                this.resetPositions();
                this.getList();
            }
        },

        resetPositions() {
            this.productFeatureSet.features.forEach((feature, index) => {
                feature.position = index + 1;
            });
        },

        getColumns() {
            return [{
                property: 'name',
                label: 'sw-settings-product-feature-sets.valuesCard.labelValue',
                primary: true
            }, {
                property: 'type',
                label: 'sw-settings-product-feature-sets.valuesCard.labelType'
            }, {
                property: 'position',
                label: 'sw-settings-product-feature-sets.valuesCard.labelPosition'
            }];
        }
    }
});
