'use client'

import {useEffect} from 'react'
import useActiveChannel from  '@/app/hooks/useActiveChannel'

const ActiveStatus =() =>{
    useActiveChannel();

    useEffect(()=>{
        axios.post('/api/users/status',{isOnline:true})
        .then(()=>{ console.log('user set to online')})
        .catch((error:any) => console.error('Failed to set online status:',error));
    
        const handleBeforeUnload= ()=>{
            const data = JSON.stringify ({ isOnline : flase});
            const blob = new Blob([data], {type : 'application/json'})
            navigator.sendBeacon('/api/users/status',blob);
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload',handleBeforeUnload)
    }, []);
    return null;
}