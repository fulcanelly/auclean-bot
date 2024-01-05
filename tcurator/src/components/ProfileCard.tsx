"use client";

export namespace ui {
  export type ChannelInfo = {
    category: string
    username: string
    country: string
    ageDays: number
    postsCount: number
    id: any
  }
}

export function ProfileCard({ info }: { info: ui.ChannelInfo }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
            Q
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold">{info.username}</h2>
          <p className="text-gray-600">{info.category}</p>
          <p className="text-sm text-gray-500">{info.country}</p>
          {/* TODO */}
          <p className="text-sm text-gray-500">Возраст 1 месяц 22 дня {info.ageDays}</p>

          <p className="text-sm text-gray-500">Постов 1305 {info.postsCount}</p>
        </div>
      </div>
    </div>
  );
};
