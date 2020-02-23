class TestBun {
    /*
     *   t = new TestBun(models);
     *   t = t.generate('borrower_invites', {
     *       email: 'itisdeji',
     *       inviter: 'magicJohnson',
     *       }, {
     *           findOrCreate: {
     *              keys: ['a]
     *              updateOnFind: true
     *           }
     *           update: true,
     *           restoreState: true,
     *           destroy: true,'
     *           deleteOnEncounter: ['email'],
     *           update: ['state', 'wake'],
     *           restoreState: ['update', 'wake'];
     *          }
     *       })
     *
     * */
    constructor(models) {
        this.modelOptionsMap = [];
        this.models = models;
        this.options = [
            'findOrCreate',
            'restoreState',
            'updateOnFind',
            'destroy',
            'deleteOnFind',
        ];

    }


    async done() {
        let mappings = this.modelOptionsMap;
        let promises = [];
        mappings.forEach(async mapping => {
            let restoreStateOption = mapping.options['restoreState'] && mapping.options['restoreState'] !== false ? mapping.options['restoreState'] : null;
            let destroy = mapping.options['destroy'] == true;
            if (restoreStateOption) {
                if (typeof restoreStateOption === 'boolean') {
                    await mapping.newModelInstance.update(mapping.oldModelInstance);
                } else {
                    // get fields 
                    let fields = restoreStateOption;
                    fields.forEach(field => {
                        mapping.newModelInstance[field] = mapping.oldModelInstance[field];
                    })
                    await push(mapping.newModelInstance.save());
                }
            }
            if (destroy) {
                await mapping.newModelInstance.destroy({
                    force: true
                });
            }
        })
        return this;
    }

    async generate(tableName, data, options = {}) {
        const q = require('q');
        const d = q.defer();

        let models = this.models;
        let func = null;
        let oldModelInstance = {};
        let optionKeys = Object.keys(options);

        optionKeys.forEach(option => {
            if (!this.options.includes(option)) {
                throw new Error(`${option} is not a valid option`)
            }
        })

        if (options.deleteOnFind) {
            // deleteOnFind should be an array
            let opts = {};
            let fields = options.deleteOnFind.keys || [];
            fields.forEach(field => {
                if (!data[field]) throw new Error(`${field} not an attribute of data`)
                opts[field] = data[field];
            })
            await models[tableName].destroy({
                where: opts
            })
        }


        if (options && options.findOrCreate) {
            if (options.deleteOnFind && ((options.findOrCreate.force !== undefined && options.findOrCreate.force == false) || !options.findOrCreate.force)) {
                d.resolve(data);
                return d.promise;
            }

            let params = options.findOrCreate.keys ? options.findOrCreate.keys : null;

            if (!params) throw new Error("findOrCreate option is missing `keys` as an attribute")
            let whereOpts = {}
            params.forEach(param => {
                if (!data[param]) throw new Error(`${param} not an attribute of data`)
                whereOpts[param] = data[param]; // match where option for findOrCreate with what was written in data
            });

            let createData = {
                where: whereOpts,
                defaults: data
            }
            try { 
                func = models[tableName].findOrCreate(createData).spread((instance, created) => {
                    Object.assign(oldModelInstance, instance._previousDataValues);
                    if (!created && options.findOrCreate.updateOnFind && options.findOrCreate.updateOnFind === true) {
                        return instance.update(data)
                    }
                    return instance;
                })
            }
            catch(e) {
                throw new Error(e)
            }

        } else {
            try {
                func = models[tableName].create(data);
            }
            catch(e) {
                throw new Error(e)
            }
        }

        let response = await func;

        this.modelOptionsMap.push({
            tableName,
            oldModelInstance,
            options,
            newModelInstance: response,
        })

        d.resolve(data);

        return d.promise;

    }
}

module.exports = TestBun