const TIME_ZONE="Asia/Kolkata";
const currentDateTime=()=>new Date();
const getTimeInZone=(date=new Date(),timeZone=TIME_ZONE)=>{
  return new Intl.DateTimeFormat("en-GB",{timeZone,hour:"2-digit",minute:"2-digit",hour12:false}).format(date);
};
const isWorkshopOpenNow=(openingTime,closingTime)=>{
  if(!openingTime||!closingTime) return false;
  const now=getTimeInZone();
  const toMinutes=(value)=>{
    const m=value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i); if(!m) return null;
    let h=Number(m[1]), min=Number(m[2]); const ap=m[3]?.toUpperCase();
    if(ap==="PM"&&h<12) h+=12; if(ap==="AM"&&h===12) h=0;
    return h*60+min;
  };
  const n=toMinutes(now), start=toMinutes(openingTime), end=toMinutes(closingTime);
  if([n,start,end].some(v=>v===null)) return false;
  return start<=end ? n>=start&&n<end : n>=start||n<end;
};
const isTimeSlotInPast=(dateValue,timeSlot)=>{
  const appointmentDay=new Date(dateValue); const now=new Date();
  const sameDay=appointmentDay.getFullYear()===now.getFullYear()&&appointmentDay.getMonth()===now.getMonth()&&appointmentDay.getDate()===now.getDate();
  if(!sameDay) return false;
  const match=String(timeSlot||"").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if(!match) return false;
  let h=Number(match[1]),m=Number(match[2]); const ap=match[3].toUpperCase(); if(ap==="PM"&&h<12)h+=12;if(ap==="AM"&&h===12)h=0;
  const slot=new Date(now); slot.setHours(h,m,0,0); return slot<=now;
};
const formatDateTime=(date)=>new Intl.DateTimeFormat("en-IN",{timeZone:TIME_ZONE,dateStyle:"medium",timeStyle:"short"}).format(new Date(date));
export {TIME_ZONE,currentDateTime,getTimeInZone,isWorkshopOpenNow,isTimeSlotInPast,formatDateTime};
