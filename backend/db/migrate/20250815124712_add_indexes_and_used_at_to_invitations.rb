class AddIndexesAndUsedAtToInvitations < ActiveRecord::Migration[8.0]
  def change
    # used_at を追加（存在しない場合のみ）
    add_column :invitations, :used_at, :datetime unless column_exists?(:invitations, :used_at)

    # token にユニークインデックス
    add_index :invitations, :token, unique: true unless index_exists?(:invitations, :token, unique: true)

    # classroom_id にインデックス
    add_index :invitations, :classroom_id unless index_exists?(:invitations, :classroom_id)
  end
end
