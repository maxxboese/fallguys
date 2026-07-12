import { useEffect, useState } from "react";
import "./App.css";

const API = "https://api2.fallguysdb.info/api/";
const SPRITE = "https://assets.fallguysdb.info/sprites/";

function getTimeRemaining(date) {
  const diff = new Date(date) - new Date();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${mins}m ${secs}s`;
}


function rarityClass(rarity) {
  if (!rarity) return "common";

  if (rarity.startsWith("special")) {
    return "special";
  }

  return rarity.replace("_", "-");
}


function App() {

  const [sections, setSections] = useState([]);
  const [assets, setAssets] = useState({});
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(Date.now());


  useEffect(() => {

    const timer = setInterval(() => {
      setTime(Date.now());
    },1000);

    return () => clearInterval(timer);

  },[]);



  useEffect(() => {

    async function load(){

      const [
        shopRes,
        unlockRes
      ] = await Promise.all([

        fetch(API+"symphony-store"),
        fetch(API+"unlocks")

      ]);


      const shop = await shopRes.json();
      const unlocks = await unlockRes.json();


      const imageMap = {};


      function scan(obj){

        if(!obj)
          return;


        if(Array.isArray(obj)){

          obj.forEach(scan);
          return;

        }


        if(typeof obj === "object"){


          if(obj._assetData?.asset_name){

            const url =
            SPRITE +
            obj._assetData.asset_name +
            ".png";


            if(obj.name)
              imageMap[
                obj.name.toLowerCase()
              ] = url;


            if(obj.id)
              imageMap[
                obj.id.toLowerCase()
              ] = url;

          }



          if(obj.image_url){

            if(obj.name)
              imageMap[
                obj.name.toLowerCase()
              ] = obj.image_url;


          }



          Object.values(obj)
          .forEach(scan);

        }

      }


      scan(unlocks);


      setAssets(imageMap);
      setSections(shop.data.data);

    }


    load().catch(console.error);


  },[]);



  function getAsset(name){

    if(!name)
      return null;


    return assets[
      name.toLowerCase()
    ] || null;

  }



  function getItemImage(item){

    // Shop artwork
    if(item.image_url_override)
      return item.image_url_override;


    // Other API artwork
    if(item.image_url)
      return item.image_url;


    // Included cosmetic lookup
    if(item.rewards){

      for(const reward of item.rewards){

        const img =
        getAsset(
          reward.display_name
        );


        if(img)
          return img;

      }

    }


    return null;

  }



  function typeName(group){

    const types = {

      costumes_upper:"Upper Costume",
      costumes_lower:"Lower Costume",
      cosmetics_emotes:"Emote",
      cosmetics_punchlines:"Celebration",
      cosmetics_nameplates:"Nameplate",
      cosmetics_nicknames:"Nickname",
      cosmetics_emoticons:"Emoticon",
      costumes_patterns:"Pattern",
      costumes_faceplates:"Face",
      costumes_colour_schemes:"Color"

    };


    return types[group] || "Item";

  }



  return (

<div className="page">


<h1 className="title">
Fall Guys Shop
</h1>



{sections.map((section, index) => (

<section
className="section"
key={`section-${section.id}-${index}`}
>


<div className="sectionHeader">

<h2>
{section.name}
</h2>


{section.target && (

<div className="timer">

{section.target.is_active ?

<>
Leaves in:{" "}
{getTimeRemaining(section.target.end)}
</>

:

<>
Starts in:{" "}
{getTimeRemaining(section.target.start)}
</>

}

</div>

)}

</div>




<div className="grid">


{section.items.map((item,index) => {


const image =
getItemImage(item);



return (

<div
className="card"
key={`${item.id}-${index}`}
onClick={() => setSelected(item)}
>



<div
className="imageBox"
style={{

backgroundImage:
item.custom_gradient_image
?
`url(${item.custom_gradient_image})`
:
undefined

}}
>


{image ? (

<img
src={image}
/>

)

:

(

<div className="noImage">
No Image
</div>

)

}


</div>



<div className="info">


<h3>
{item.display_name}
</h3>



<span
className={
"rarity "+
rarityClass(item.rarity)
}
>

{item.rarity?.startsWith("special")
? "SPECIAL"
: item.rarity}

</span>



<div className="price">

{item.payment?.currency_id === "gems" ? (

<img
className="currencyIcon"
src="https://assets.fallguysdb.info/sprites/ui_gemcurrency_image.png"
/>

) : item.payment?.currency_id === "kudos" ? (

<img
className="currencyIcon"
src="https://assets.fallguysdb.info/sprites/ui_currency_kudos_1080p.png"
/>

) : null}

<span>
{item.payment?.price}
</span>

</div>



{item.subtitle && (

<p className="subtitle">

{item.subtitle}

</p>

)}



{item.ribbon_label && (

<p className="ribbon">

{item.ribbon_label}

</p>

)}


</div>



</div>

);


})}


</div>


</section>

))}





{selected && (

<div
className="popupBackground"
onClick={() => setSelected(null)}
>


<div
className="popup"
onClick={(e)=>e.stopPropagation()}
>


<button
onClick={()=>setSelected(null)}
>
X
</button>


<h2>
{selected.display_name}
</h2>


<h3>
Includes:
</h3>


{selected.rewards?.map((r,i)=>{


const img =
getAsset(
r.display_name
);


return (

<div
className="reward"
key={`${r.group_id}-${r.display_name}-${i}`}
>


{img && (

<img
src={img}
/>

)}


<span>
{r.display_name}
</span>


</div>

);


})}


</div>

</div>

)}


</div>

);


}


export default App;