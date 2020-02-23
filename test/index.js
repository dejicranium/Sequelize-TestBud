const models = require("../test/deps/models");
const mocha = require("mocha");
const chai = require('chai');
require('chai').should();

const TestBud = require('./../index');

describe("#TestBud", (done) => {
    const testBud = new TestBud(models);

    after(done => {
       testBud.done(); 
       done();
    });

    let data = {
        first_name: 'Deji',
        last_name: 'Atoyebi',
        sex: 'Male',
        password: 'something'
    };

    let options = {
        findOrCreate: {
            keys: ['first_name']
        }
    }

    it ('should find a user with given field', async() => {
        //  delete users with name deji;
        let users = await models.users.findAll({where: {first_name: 'Deji'}});
        users.forEach(async user=> {
            await user.destroy({force: true})
        });
        
        await testBud.generate('users', 
            data = {
                 first_name: 'Deji',
                 last_name: 'Atoyebi',
                 sex: 'Male',
                 password: 'something'
            }, 
            options = {
                findOrCreate: {
                    keys: ['first_name']
                }
            });
        //console.log(testData)
        let user = await models.users.findOne({where: {first_name: 'Deji'}});
        return user.should.have.property('last_name')
        
    })

    it ('should not create but update when found', async() => {
        let userData = testBud.generate('users', data= {
            first_name: 'Deji',
            last_name: "Fela"
        },
        options =  {
            findOrCreate: {
                keys: ['first_name'],
                updateOnFind: true
            }
        })
        let user = await models.users.findOne({where: {first_name: 'Deji'}});
        return user['last_name'].should.equal('fela');
    })

    it ('should restore some fields', async() => {

        let userData = testBud.generate('users', data= {
            first_name: 'Deji',
            last_name: "Undertaker",
            sex: "Male"
        },
        options =  {
            findOrCreate: {
                keys: ['first_name'],
                updateOnFind: true
            },
            restoreState: ['Undertaker']
        })
        let user = await models.users.findOne({where: {first_name: 'Deji'}});
        return user['last_name'].should.equal('Makachukwu');
    })

    it ('should not create but update when found', async() => {
        let userData = testBud.generate('users', data= {
            first_name: 'Deji',
            last_name: "Fela"
        },
        options =  {
            findOrCreate: {
                keys: ['first_name'],
                updateOnFind: true
            }
        })
        let user = await models.users.findOne({where: {first_name: 'Deji'}});
        return user['last_name'].should.equal('Fela');
    })

    it ('should throw an error when invalid option is passed', async() => {
        let userData = testBud.generate('users', data= {
            first_name: 'Deji',
            last_name: "Fela"
        },
        options =  {
            findOrCreate: {
                keys: ['first_name'],
                updateOnFind: true
            },
            makeshift: {}
        }).then(resp=> {

        }).catch(err=> {
            err.message.should.equal('makeshift is not a valid option')
        })
    })
    it ('should restore all fields', async() => {
        let user = await models.users.findOne({where: {first_name: "Deji"}});
        user.last_name =  "Something";
        await user.save();
        
        await testBud.generate('users', data = {
            first_name: "Deji",
            last_name: "Makachukwu",
            sex: "undefined",
            university_id: "1",
            password: "careful",
            image: "https://werere.qsere",
            username: "deji_toye"
        },
        options =  {
            findOrCreate: {
                keys: ['first_name'],
                updateOnFind: true
            },
            restoreState: true
        })

        await testBud.done();
    })
    it ('should destroy after creation', async() => {
        await testBud.generate('users', data = {
            first_name: "Deji",
            last_name: "Makachukwu",
            sex: "undefined",
            university_id: "1",
            password: "careful",
            image: "https://werere.qsere",
            username: "deji_toye"
        },
        options =  {
            findOrCreate: {
                keys: ['first_name'],
                updateOnFind: true
            },
            destroy: true
        })

    })
})