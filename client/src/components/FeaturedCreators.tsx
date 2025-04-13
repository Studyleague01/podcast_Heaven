import React from 'react';
import { Link } from 'wouter';

// Real data for featured creators from the provided JSON
const channelsData = {
  "UCyBzV_g6Vfv5GM3aMQb3Y_A": {
    "name": "Alpha Akki",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/RF_q_kpzdUr4a9ncpqciyqB-rNU2SbCmzCQk-ieAllpcsjN72G3sLD-kY8YIS4WNgpeMFmmt=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "325K",
    "verified": true,
  },
  "UCrB8j1YCbuYhIcImwNkJgCg": {
    "name": "Alpha Akki Dark",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/nHoYEdWZuC-bxmZSWz2hi2Qr0UGXDA82WfkD5vBBCYKK5yR9zwDQqn83YnrCIMlHXNEMBRRm=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "157K",
    "verified": false,
  },
  "UCPGNioeYrJq4nyAt-DVIHZg": {
    "name": "SR PAY STORIES",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/iwXw7B-VLQS6o-EYUH12VkBRTT083AF1nRCt9DyFE3NlBUKQndRwNRQ-00Kj2U2O9zY6y-kzdw=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "636K",
    "verified": true,
  },
  "UCEEi1lDCkKi1ukmTAgc9-zA": {
    "name": "ShivamIsOn",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/UeKE515Gzzs_tIrVphVk_ElfK2TGVpTb1LOSiGAVZL1fUFEv5gBe6a7-jITlg9kV8BKGpTedwg=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "6.19M",
    "verified": true,
  },
  "UCVIq229U5A54UVzHQJqZCPQ": {
    "name": "Akshay Vashisht",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/Vipaa3GwF2MX5MkciYmlfjb494S7PF3X5d3sgIxo4YxkbZTFqXwqWq31qzwMQzj09TE29T0Cuw=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "496K",
    "verified": true,
  },
  "UCcKMjICfQPjiVMpqS-yF7hA": {
    "name": "Thrill Tales",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/kJuY3HIBnUf0pfeDBrtguHSpLiR--ijbyzRLOQoI-ttznCyeSdnDpPZG-zuGVOapz20KE0WG=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "47.7K",
    "verified": false,
  },
  "UCWcQCJHYOK2ZZRA2Sym0mOw": {
    "name": "Amaan parkar",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/KiJBzyxjLildz01hdA81rdy7eMM1hN-TtM8QnRRfT2Ca5xqDGv5G2ehRAhPNrNAJHV6Mp-t4Ag=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "699K",
    "verified": true,
  },
  "UCn372MiubHTkPFwxKVv45LQ": {
    "name": "Fintale",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/3fIaw4iphqyDEIyZ9oNpAHFDBl3z2nAxMJ10QvtPg8nYqipzebpZEPh10UyI4mfWYgw2hFE1=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "65.8K",
    "verified": false,
  },
  "UCUF0EGa7_yM4TXQl4LYt-YA": {
    "name": "Alpha Crime",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/o4uZcD3zXdL0a5nlKSlkr9s2iCZ2xbu_9-3D2tvKvgA59I5AGWDpzj_-f8dXBJ6TzNuKAzKygg=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "56K",
    "verified": false,
  },
  "UCRidj8Tvrnf5jeIwzFDj0FQ": {
    "name": "BADMASH icON",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/ytc/AIdro_lppItEBAVxYU9Nz7yOzKSyi3pDwFzEXpDkUMERbbkeAmw=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": "3.95M",
    "verified": true,
  },
  "UCz67TNWBqU38S8VRvjDO2wg": {
    "name": "Khooni Monday",
    "avatarUrl": "https://pol1.piproxy.ggtyler.dev/ytc/AIdro_mQVLyUUhUVhxLq75TkfalSsWuDdCbOe7eeMa-oxx-b94c=s160-c-k-c0x00ffffff-no-rw?host=yt3.googleusercontent.com",
    "subscriberCount": 5680000,
    "verified": true,
  }
};

// Convert the channel data to our featured creators format
const featuredCreators = Object.entries(channelsData).map(([id, data]) => ({
  id,
  name: data.name,
  avatarUrl: data.avatarUrl,
  url: `/channel/${id}`,
  subscribers: data.subscriberCount,
  verified: data.verified
}));

const FeaturedCreators: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="material-icons text-orange-500 mr-2">verified</span>
        Featured Creators
      </h2>
      
      <div className="overflow-x-auto hide-scrollbar pb-6">
        <div className="flex space-x-6">
          {featuredCreators.map((creator) => (
            <Link key={creator.id} href={creator.url}>
              <a className="flex flex-col items-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-orange-500 p-0.5 flex-shrink-0 hover:scale-105 transition-transform cursor-pointer relative shadow-lg">
                  <img 
                    src={creator.avatarUrl} 
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name.substring(0, 2))}&background=random&size=200`;
                    }}
                  />
                  {creator.verified && (
                    <span className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transform translate-x-1 translate-y-1 shadow-md">
                      <span className="material-icons text-[14px]">verified</span>
                    </span>
                  )}
                </div>
                <span className="mt-3 text-sm md:text-base font-medium text-center max-w-[120px] truncate">{creator.name}</span>
                {creator.subscribers && (
                  <span className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors mt-1">
                    {creator.subscribers} subscribers
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCreators;
