class CreateInvitations < ActiveRecord::Migration[8.0]
  def change
    create_table :invitations do |t|
      t.string :token
      t.string :email
      t.references :classroom, null: false, foreign_key: true
      t.boolean :used

      t.timestamps
    end
  end
end
