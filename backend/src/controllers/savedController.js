const SavedPlace = require('../models/SavedPlace')

async function getSaved(_req, res, next) {
  try {
    const places = await SavedPlace.find().sort({ savedAt: -1 })
    res.json(places)
  } catch (err) {
    next(err)
  }
}

async function savePlace(req, res, next) {
  try {
    const body = { ...req.body }

    // ✅ Fix tags — prevent CastError from object arrays
    if (body.tags) {
      body.tags = Array.isArray(body.tags)
        ? body.tags.map(tag => typeof tag === 'object' ? Object.values(tag).join(' ') : String(tag))
        : []
    }

    const place = await SavedPlace.findOneAndUpdate(
      { osm_id: body.osm_id },
      body,
      { upsert: true, new: true }
    )
    res.status(201).json(place)
  } catch (err) {
    console.error('Save error:', err.message)
    next(err)
  }
}

async function unsavePlace(req, res, next) {
  try {
    await SavedPlace.findOneAndDelete({ osm_id: req.params.id })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { getSaved, savePlace, unsavePlace }