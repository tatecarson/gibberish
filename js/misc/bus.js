let g = require( 'genish.js' ),
    ugen = require( '../ugen.js' )

module.exports = function( Gibberish ) {

  let Bus = { 
    factory: null,//Gibberish.factory( g.add( 0 ) , 'bus', [ 0, 1 ]  ),

    create() {
      let bus = Object.create( ugen )
      
      bus.callback = function() {
        output[ 0 ] = output[ 1 ] = 0

        for( let i = 0, length = arguments.length; i < length; i++ ) {
          let input = arguments[ i ]
          output[ 0 ] += input
          output[ 1 ] += input
        }

        return output
      }

      bus.id = Gibberish.factory.getUID()
      bus.dirty = true
      bus.type = 'bus'
      bus.ugenName = 'bus_' + bus.id
      bus.inputs = []
      bus.inputNames = []

      bus.connect = ( target, level = 1 ) => {
        if( target.isStereo ) {
          throw Error( 'You cannot connect a stereo input to a mono bus.' )
          return
        }

        if( target.inputs )
          target.inputs.push( this )
        else
          target.input = this

        Gibberish.dirty( target )
        return this
      }

      bus.chain = ( target, level = 1 ) => {
        this.connect( target, level )
        return target
      }

      bus.disconnectUgen = ( ugen ) => {
        let removeIdx = -1
        for( let i = 0; i < this.inputs.length; i++ ) {
          let input = this.inputs[ i ]

          if( isNaN( input ) && ugen === input ) {
            removeIdx = i
            break;
          }
        }
        
        if( removeIdx !== -1 ) {
          this.inputs.splice( removeIdx, 1 )
          Gibberish.dirty( this )
        }
      }
      
      return bus
    }
  }

  return Bus.create

}

