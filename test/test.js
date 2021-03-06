/**
 * BDD Test
 */
const path = require('path')
const fs = require('fs')
const { expect } = require('chai')
const rimraf = require('rimraf')
const checkGit = require('../lib/util/check')
const getOptions = require('../lib/core/option')
const clone = require('../lib/core/clone')
const down = require('../lib/core/down')
const download = require('../lib/index')

const OWNER_REPO_URL = 'mnichangxin/repo-git-downloader'
const GITHUB_SSH_URL = 'git@github.com:mnichangxin/repo-git-downloader.git'
const GITLAB_SSH_URL = 'git@gitlab.com:mnichangxin/repo-git-downloader.git'
const GITHUB_HTTPS_URL = 'https://github.com/mnichangxin/repo-git-downloader.git'
const GITLAB_HTTPS_URL = 'https://gitlab.com/mnichangxin/repo-git-downloader.git'
const OWNER_REPO_URL_CHECKOUT = 'mnichangxin/repo-git-downloader#dev'
const GITHUB_SSH_URL_CHECKOUT = 'git@github.com:mnichangxin/repo-git-downloader#dev.git'
const GITHUB_HTTPS_URL_CHECKOUT = 'https://github.com/mnichangxin/repo-git-downloader#dev.git'
const GITLAB_SSH_URL_CHECKOUT = 'git@gitlab.com:mnichangxin/repo-git-downloader#dev.git'
const CUSTOM_URL = 'https://github.com/mnichangxin/repo-git-downloader.git#dev'
const GITHUB_DOWNLOAD_URL = 'https://github.com/mnichangxin/repo-git-downloader/archive/dev.zip'
const GITLAB_DOWNLOAD_URL = 'https://gitlab.com/mnichangxin/repo-git-downloader/repository/archive.zip?ref=dev'
const MOCK_CLONE_PATH = path.resolve(__dirname, 'mock-clone-path')
const MOCK_DOWN_PATH = path.resolve(__dirname, 'mock-down-path')
const MOCK_DOWNLOAD_PATH = path.resolve(__dirname, 'mock-download-path')

describe('test repo-git-downloader', () => {
    describe('test check git', () => {
        it('git is installed/uninstalled', (done) => {
            checkGit((err) => {
                if (err) {
                    return done(err)
                }
                done()
            })
        })
    })
    describe('test get options', () => {
        const dist = process.cwd()
        let defaultOptions = {
            repo: GITHUB_SSH_URL,
            checkout: '',
            type: 'ssh',
            dist: dist,
            custom: false,
        }
        let target = {}
        beforeEach(() => {
            target = {}
        })
        it('owner/repo url, options default', () => {
            const options = getOptions(OWNER_REPO_URL)
            expect(options).to.eql(Object.assign(target, defaultOptions))
        })
        it('github ssh url, options default', () => {
            const options = getOptions(GITHUB_SSH_URL)
            expect(options).to.eql(Object.assign(target, defaultOptions))
        })
        it('gitlab ssh url, options default', () => {
            const options = getOptions(GITLAB_SSH_URL)
            expect(options).to.eql(Object.assign(target, defaultOptions, { repo: GITLAB_SSH_URL}))
        })
        it('owner/repo url, options type:https', () => {
            const options = getOptions(OWNER_REPO_URL, {
                type: 'https'
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, { 
                repo: GITHUB_HTTPS_URL,
                type: 'https'
            }))
        })
        it('github ssh url, options type:https', () => {
            const options = getOptions(GITHUB_SSH_URL, {
                type: 'https'
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_HTTPS_URL,
                type: 'https'
            }))
        })
        it('gitlab ssh url, options type:https', () => {
            const options = getOptions(GITLAB_SSH_URL, {
                type: 'https'
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITLAB_HTTPS_URL,
                type: 'https'
            }))
        })
        it('owner/repo ssh url has checkout', () => {
            const options = getOptions(OWNER_REPO_URL_CHECKOUT)
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_SSH_URL,
                checkout: 'dev'
            }))
        })
        it('github ssh url has checkout', () => {
            const options = getOptions(GITHUB_SSH_URL_CHECKOUT)
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_SSH_URL,
                checkout: 'dev'
            }))
        })
        it('github https url has checkout', () => {
            const options = getOptions(GITHUB_HTTPS_URL_CHECKOUT)
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_SSH_URL,
                checkout: 'dev'
            }))
        })
        it('owner/repo ssh url has checkout, options type:https', () => {
            const options = getOptions(OWNER_REPO_URL_CHECKOUT, {
                type: 'https'
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_HTTPS_URL,
                checkout: 'dev',
                type: 'https'
            }))
        })
        it('custom url', () => {
            const options = getOptions(CUSTOM_URL, {
                custom: true
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_HTTPS_URL,
                checkout: 'dev',
                custom: true
            }))
        })
        it('github ssh url, option type:direct', () => {
            const options = getOptions(OWNER_REPO_URL_CHECKOUT, {
                type: 'direct'
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITHUB_DOWNLOAD_URL,
                checkout: 'dev',
                type: 'direct'
            }))
        })
        it('gitlab ssh url, option type:direct', () => {
            const options = getOptions(GITLAB_SSH_URL_CHECKOUT, {
                type: 'direct'
            })
            expect(options).to.eql(Object.assign(target, defaultOptions, {
                repo: GITLAB_DOWNLOAD_URL,
                checkout: 'dev',
                type: 'direct'
            }))
        })
    })
    describe('test clone', () => {
        const mockClone = (repo, checkout, done) => {
            clone({
                repo: repo,
                checkout: checkout,
                dist: MOCK_CLONE_PATH
            }, (err) => {
                if (err) {
                    done(err)
                }
                const isExists = fs.existsSync(`${MOCK_CLONE_PATH}/repo-git-downloader`)
                expect(isExists).to.be.true
                done()
            })
        }
        it('ssh clone', (done) => {
            mockClone(GITHUB_SSH_URL, '', done)
        })
        it('https clone', (done) => {
            mockClone(GITHUB_HTTPS_URL, '', done)
        })
        it('ssh clone with checkout', (done) => {
            mockClone(GITHUB_SSH_URL, 'dev', done)
        })
        it('https clone with checkout', (done) => {
            mockClone(GITHUB_HTTPS_URL, 'dev', done)
        })
        afterEach(() => {
            rimraf.sync(`${MOCK_CLONE_PATH}/repo-git-downloader`)
        })
    })
    describe('test down', () => {
        const mockDown = (repo, done) => {
            down({
                repo: repo,
                dist: MOCK_DOWN_PATH
            }, (err) => {
                if (err) {
                    done(err)
                } else {
                    let isExists = false
                    fs.readdirSync(MOCK_DOWN_PATH).forEach((filename) => {
                        if (/.*\.zip/.test(filename)) {
                            isExists = true
                        }
                    })
                    expect(isExists).to.be.true
                    done()
                }
            })
        }
        it('github down', (done) => {
            mockDown(GITHUB_DOWNLOAD_URL, done)
        })
        it('gitlab down', (done) => {
            mockDown(GITLAB_DOWNLOAD_URL, done)
        })
        afterEach(() => {
            rimraf.sync(`${MOCK_DOWN_PATH}/*.zip`)
        })
    })
    describe('test index', () => {
        it('no options', (done) => {
            process.chdir(MOCK_DOWNLOAD_PATH)
            download(OWNER_REPO_URL, (err) => {
                if (err) {
                    done(err)
                }
                const isExists = fs.existsSync(`${MOCK_DOWNLOAD_PATH}/repo-git-downloader`)
                expect(isExists).to.be.true
                done()
            })
        })
        it('has options', (done) => {
            download(OWNER_REPO_URL, {
                dist: MOCK_DOWNLOAD_PATH
            }, (err) => {
                if (err) {
                    done(err)
                }
                const isExists  = fs.existsSync(`${MOCK_DOWNLOAD_PATH}/repo-git-downloader`)
                expect(isExists).to.be.true
                done()
            })
        })
        afterEach(() => {
            rimraf.sync(`${MOCK_DOWNLOAD_PATH}/repo-git-downloader`)
        })
    })
})