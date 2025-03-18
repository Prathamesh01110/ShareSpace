'use client';
import { useState } from "react";
import Navbar from "@/components/navbar"
import LeftSideSmallNav from "../../components/spacecomp/leftsidesmallnav"
import RightSideSmallNav from "../../components/spacecomp/RightSideSmallNav"
import Main from "@/components/spacecomp/main"

type SearchItem = {
  name: string;
  id: string;
};
export default function Page() {
  const [searchData, setSearchData] = useState<SearchItem[]>([]);

  return (
    <div>
      <Navbar searchData={searchData}/>
      <div className="flex flex-row w-full fixed top-24 left-0 right-0 bg-white z-10"><LeftSideSmallNav/><RightSideSmallNav/></div>
      <hr />
      <div>
      <Main setSearchData={setSearchData} />
      </div>
    </div>
  )
}
