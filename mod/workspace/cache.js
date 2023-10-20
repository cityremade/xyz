const file = require('../provider/file')

const cloudfront = require('../provider/cloudfront')

const mongodb = require('../provider/mongodb')

const http = require('./httpsAgent')

const getFrom = {
  'https': ref => http(ref),
  'file': ref => file(ref.split(/:(.*)/s)[1]),
  'cloudfront': ref => cloudfront(ref.split(/:(.*)/s)[1]),
  'mongodb': ref => mongodb(ref.split(/:(.*)/s)[1])
}

const assignDefaults = require('./assignDefaults')

process.env.WORKSPACE_AGE ??= 3600000

let workspace = null

const logger = require('../utils/logger')

module.exports = async () => {

  const timestamp = Date.now()

  // Cache workspace if empty.
  if (!workspace) {
    await cache()
    logger(`Workspace empty; Time to cache: ${Date.now() - timestamp}`, 'workspace')
  }

  // Logically assign timestamp.
  workspace.timestamp ??= timestamp

  // Cache workspace if expired.
  if ((timestamp - workspace.timestamp) > +process.env.WORKSPACE_AGE) {

    await cache()
    logger(`Workspace cache expired; Time to cache: ${Date.now() - timestamp}`, 'workspace')
    workspace.timestamp = timestamp
  }

  return workspace
}

async function cache() {

  // Get workspace from source.
  workspace = process.env.WORKSPACE ?
    await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE) : {}

  // Return error if source failed.
  if (workspace instanceof Error) return workspace

  // Assign default view and query templates to workspace.
  workspace.templates = {
    // Query templates:
    gaz_query: {
      template: require('./templates/gaz_query'),
    },
    get_last_location: {
      template: require('./templates/get_last_location'),
    },
    distinct_values: {
      template: require('./templates/distinct_values'),
    },
    field_stats: {
      template: require('./templates/field_stats'),
    },
    field_min: {
      template: require('./templates/field_min'),
    },
    field_max: {
      template: require('./templates/field_max'),
    },
    get_nnearest: {
      render: require('./templates/get_nnearest'),
    },
    geojson: {
      render: require('./templates/geojson'),
    },
    cluster: {
      render: require('./templates/cluster'),
      reduce: true
    },
    cluster_hex: {
      render: require('./templates/cluster_hex'),
      reduce: true
    },
    wkt: {
      render: require('./templates/wkt'),
      reduce: true
    },
    infotip: {
      render: require('./templates/infotip'),
    },
    layer_extent: {
      template: require('./templates/layer_extent'),
    },
    mvt_cache: {
      admin: true,
      render: require('./templates/mvt_cache'),
    },
    mvt_cache_delete_intersects: {
      template: require('./templates/mvt_cache_delete_intersects'),
    },

    // Default templates can be overridden by assigning a template with the same name.
    ...workspace.templates
  }

  await assignDefaults(workspace)

  if (workspace.plugins) {

    console.warn(`Default plugins should be defined in the default workspace.locale{}`)
  }

  // Substitute all SRC_* variables in locales.
  workspace.locales = JSON.parse(
    JSON.stringify(workspace.locales).replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)
  )

}