import { parse } from './commands/color'
describe('test color command', () => {
    test('hex to rgb', () => {
        expect(parse('#00aced')).toEqual({
            color: 44269,
            description:'`#00aced`\n'+
                        '`rgb(0, 172, 237)`\n'+
                        '`vec3(0.0, 0.6745098039215687, 0.9294117647058824)`\n'+
                        '`int 44269`\n'+
                        '`bin 0000 0000 1010 1100 1110 1101`'
        })
    })
})

import { getchardata } from './commands/go';
describe('test go command', () => {

})