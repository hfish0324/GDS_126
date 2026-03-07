class SoundManager
{
    constructor(_soundNodes)
    {
        for(let i = 0; i < _soundNodes.length; i++)
        {
            let soundName = _soundNodes[i].getAttribute(`name`);
            this[soundName] = _soundNodes[i];
            this[soundName].load();
        }
    }

    play(_sound, _start = 0, _loop = false)
    {
        if(!this[_sound])
        {
            console.log(`Sound not loaded: ${_sound}`);
            return;
        }

        this[_sound].pause();
        this[_sound].currentTime = _start;
        this[_sound].loop = _loop;
        this[_sound].play().catch(function(error)
        {
            console.log(`Could not play sound: ${_sound}`, error);
        });
    }

    stop(_sound)
    {
        if(!this[_sound]) return;

        this[_sound].pause();
        this[_sound].currentTime = 0;
    }
}

let soundNodes = document.querySelectorAll(`audio`);
let sounds = null;

if(soundNodes.length > 0)
{
    sounds = new SoundManager(soundNodes);
}

soundNodes = null;