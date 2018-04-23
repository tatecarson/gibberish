const Queue = require( '../external/priorityqueue.js' )
const Big   = require( 'big.js' )
const proxy = require( '../workletProxy.js' )

module.exports = function( Gibberish ) {

let Sequencer = props => {
  let seq = {
    __isRunning:false,

    __valuesPhase:  0,
    __timingsPhase: 0,

    tick() {
      let value  = seq.values[  seq.__valuesPhase++  % seq.values.length  ],
          timing = seq.timings[ seq.__timingsPhase++ % seq.timings.length ]

      if( typeof timing === 'function' ) timing = timing()

      if( typeof value === 'function' && seq.target === undefined ) {
        value()
      }else if( typeof seq.target[ seq.key ] === 'function' ) {
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ]( value )
      }else{
        if( typeof value === 'function' ) value = value()
        seq.target[ seq.key ] = value
      }
      
      if( seq.__isRunning === true ) {
        Gibberish.scheduler.add( timing, seq.tick, seq.priority )
      }
    },

    start( delay = 0 ) {
      seq.__isRunning = true
      Gibberish.scheduler.add( delay, seq.tick, seq.priority )
      return seq
    },

    stop() {
      seq.__isRunning = false
      return seq
    }
  }

  props.id = Gibberish.factory.getUID()

  // need a separate reference to the properties for worklet meta-programming
  const properties = Object.assign( {}, Sequencer.defaults, props )
  Object.assign( seq, properties ) 
  seq.__properties__ = properties

  return proxy( ['Sequencer'], properties, seq )
}

Sequencer.defaults = { priority:0 }

Sequencer.make = function( values, timings, target, key ) {
  return Sequencer({ values, timings, target, key })
}

return Sequencer

}