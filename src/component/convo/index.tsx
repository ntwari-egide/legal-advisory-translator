import { RiMore2Line } from "react-icons/ri";

type ConvoProps = {
  content: string;
  timeAgo: string;
};

const Convo = ({ content, timeAgo }: ConvoProps) => {
  return (
    <div className="flex flex-row justify-between cursor-pointer hover:scale-[1.01] transition-all">
      <div className="flex-row flex space-x-4 justify-center items-center">
        <img
          src={
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
          }
          className="w-10 h-10 rounded-full object-cover border"
        />

        <div className="flex flex-col">
          <h1 className="font-medium text-[#333333] text-[1.8vh]">{content}</h1>
          <h1 className="text-[#B2B2B2] text-[1.6vh] font-medium">{timeAgo}</h1>
        </div>
      </div>
      <RiMore2Line className="text-[3vh] cursor-pointer hover:scale-[1.17] transition-all text-[#808080]" />
    </div>
  );
};

export default Convo;
