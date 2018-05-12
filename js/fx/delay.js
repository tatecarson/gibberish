let g = require( 'genish.js' ),
    effect = require( './effect.js' )

module.exports = function( Gibberish ) {
 
let Delay = inputProps => {
  let props = Object.assign( { delayLength: 44100 }, Delay.defaults, inputProps ),
      delay = Object.create( effect )

  delay.__createGraph = function() {
    let isStereo = props.input.isStereo !== undefined ? props.input.isStereo : false 
    
    let input      = g.in( 'input' ),
        delayTime  = g.in( 'time' ),
        wetdry     = g.in( 'wetdry' ),
        leftInput  = isStereo ? input[ 0 ] : input,
        rightInput = isStereo ? input[ 1 ] : null
      
    let feedback = g.in( 'feedback' )

    // left channel
    let feedbackHistoryL = g.history()
    let echoL = g.delay( g.add( leftInput, g.mul( feedbackHistoryL.out, feedback ) ), delayTime, { size:props.delayLength })
    feedbackHistoryL.in( echoL )
    let left = g.mix( leftInput, echoL, wetdry )

    if( isStereo ) {
      // right channel
      let feedbackHistoryR = g.history()
      let echoR = g.delay( g.add( rightInput, g.mul( feedbackHistoryR.out, feedback ) ), delayTime, { size:props.delayLength })
      feedbackHistoryR.in( echoR )
      const right = g.mix( rightInput, echoR, wetdry )

      delay.graph = [ left, right ]
    }else{
      delay.graph = left 
    }
  }

  delay.__createGraph()
  delay.__requiresRecompilation = [ 'input' ]
  
  const out = Gibberish.factory( 
    delay,
    delay.graph, 
    ['fx','delay'], 
    props 
  )

  return out
}

Delay.defaults = {
  input:0,
  feedback:.75,
  time: 11025,
  wetdry: .5
}

return Delay

}
