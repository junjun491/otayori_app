class HardenInvitationsColumns < ActiveRecord::Migration[8.0]
  def change
    # 1) NOT NULL & デフォルト
    change_column_null :invitations, :email, false
    change_column_null :invitations, :token, false

    # used: null禁止 + デフォルト false
    change_column_default :invitations, :used, from: nil, to: false
    change_column_null :invitations, :used, false, false

    # 2) 有効期限カラム（なければ追加）
    add_column :invitations, :expires_at, :datetime unless column_exists?(:invitations, :expires_at)

    # 3) 一意制約（token）
    add_index :invitations, :token, unique: true unless index_exists?(:invitations, :token, unique: true)
  end
end
