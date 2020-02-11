const requestBearer = require('../mod/requestBearer')

const Md = require('mobile-detect')

const getWorkspace = require('../mod/workspace/get')

const workspace = getWorkspace()

const getViews = require('../mod/views/_views')

const views = getViews(workspace)

module.exports = (req, res) => requestBearer(req, res, [ handler ], {
  public: true,
  login: true
})

async function handler(req, res){

  if (req.query.clear_cache) {
    Object.assign(workspace, getWorkspace())
    Object.assign(views, getQueries(workspace))
    return res.end()
  }

  Object.assign(workspace, await workspace)
  Object.assign(views, await views)

  const md = new Md(req.headers['user-agent'])

  const view = views[(md.mobile() === null || md.tablet() !== null) && 'desktop' || 'mobile'];
  
  const html = view.template({
    dir: process.env.DIR || '',
    title: process.env.TITLE || 'GEOLYTIX | XYZ',
    token: req.query.token || req.params.token.signed || '""',
    log: process.env.LOG_LEVEL || '""',
    login: (process.env.PRIVATE || process.env.PUBLIC) && 'true' || '""',
  })

  res.send(html)

}