will be adding webrtc to enable video chatting and anonymous group chat feature , 

i am planning to make it really crazy , 

like this really is going to get crazy once i do the anonymous video call feature , 
since that kind of a product is something that is actually getting me excited and 
i will do it really soon,

i am not left with a lot of time  , i have my mid sem exams coming in where i know nothing of what has happened in class , 

but i am going to make it stick .,,


problems that i may face--

1. i am not using core socket io since that is required for signalling,
2. one choice is that i go for i use pusher itself for signalling but idk if that will hold for the changes that i have made ,

3. and the chats are not actually that fast , i dont know if that's working or not, sometimes it does , and sometimes it just utterly fails , first need to fix it properly

4. ofc pusher doesn't provide media streaming, gotta use web rtc for it

5. stun and turn servers , i believe should just import , or else i will just keep on making it big with time 


---------

new upadate , what  i want cannot be done just by web rtc , we need to look for much morestuffs, to be like able to do such a thing onto my chat app, 
wb rtc doesnt support multiuser (atleast not the group chat so far, but as far as i know 10 people is the max people that is going to happen but ia m scared we have to handle 100 connections simultaneously handling their individual video , 

i will see if there are any more improvements that can be made , 

but currently , not until the end of the syllabus i will not be able to look into my project, 

my deadline that i had thought of doing this thing in a span of 2 days is by far done,

so i will now rather fall back , 

if i get awareness to maintain consistency in contributions ,  i will be jsut dropping here and put my 5 -10 min of simultaneous thinking and implementation ideas ,
well thats all i can do , but i definitely do thing this is going to help me on the longer run to implement new things onto this platform , 


i will get this big for sure, 

like for get me one pls and also i got idea whether i can do the railgun server scraping idea, 

thats cool on its own , 

we will see, 

i have already put up a lot of time .
---------------------------------

okay for setting up the i checked out flyby.io and free option i have is jetski video chat but i cannot customise the stuffs to my need whihc hinders my thought of putting it into a anonymous video chat features and things of thosekinds , 
i dont know how well i am going to do it , 

it uses selective forwarding unit , 

it requires huge knowledde of who are actually visible to you and stuffs of that kind , it can be kinky to learn all the things but slowly and steadily i move to my goal, Janus WebRTC Server - Lightweight, powerful, good for low-latency applications.
MediaSoup - Great for self-hosted SFU with Node.js support.
Jitsi Meet - Fully featured WebRTC-based video conferencing solution.
Pion - A Go-based WebRTC SFU with great flexibility.

1️⃣ Why Docker for MediaSoup?
MediaSoup has native dependencies (C++ bindings for Node.js).
Installing it directly can cause version mismatches (e.g., different OS, missing system packages).
Docker ensures consistent environments across dev and production.

Why "Cloud" Hosting?
If you want your app to be publicly accessible, you need hosting.
SFUs like MediaSoup need a stable server with good bandwidth.
Free services like Render / Railway can work, but they may have limits on CPU, RAM, and bandwidth

cloud hosting will defiintely have problems , i would love hosting which supports the browser too , but for now free solutions doesnt give you free UDP , so will figure it out soon,

namaskara devru , happy shivratri

--------------------------------------------
