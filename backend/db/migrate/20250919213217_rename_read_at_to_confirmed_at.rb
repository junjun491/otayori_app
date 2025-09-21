class RenameReadAtToConfirmedAt < ActiveRecord::Migration[8.0]
  def change
    rename_column :message_deliveries, :read_at, :confirmed_at

    # 旧インデックス(read_at)が残っていた場合に備えた削除（存在すれば）
    remove_index :message_deliveries, :read_at, if_exists: true

    # すでに confirmed_at のインデックスがあるなら追加しない
    add_index :message_deliveries, :confirmed_at unless
      index_exists?(:message_deliveries, :confirmed_at)
  end
end
