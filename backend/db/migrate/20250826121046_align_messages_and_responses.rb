class AlignMessagesAndResponses < ActiveRecord::Migration[8.0]
  def up
    # messages: target_all 追加、status デフォルト/NOT NULL、索引
    unless column_exists?(:messages, :target_all)
      add_column :messages, :target_all, :boolean, null: false, default: true
    end

    change_column_default :messages, :status, from: nil, to: 0
    execute "UPDATE messages SET status = 0 WHERE status IS NULL"
    change_column_null :messages, :status, false

    unless index_exists?(:messages, [ :classroom_id, :status ])
      add_index :messages, [ :classroom_id, :status ]
    end
    unless index_exists?(:messages, :published_at)
      add_index :messages, :published_at
    end
    # deadline は date のまま（必要ならインデックス）
    unless index_exists?(:messages, :deadline)
      add_index :messages, :deadline
    end

    # message_deliveries: ユニーク制約と read_at インデックス
    unless index_exists?(:message_deliveries, [ :message_id, :student_id ], unique: true)
      add_index :message_deliveries, [ :message_id, :student_id ], unique: true
    end
    unless index_exists?(:message_deliveries, :read_at)
      add_index :message_deliveries, :read_at
    end

    # message_responses: 新規
    unless table_exists?(:message_responses)
      create_table :message_responses do |t|
        t.references :message_delivery, null: false, foreign_key: true
        t.integer :status, null: false, default: 0 # 0:draft, 1:submitted
        t.jsonb :form_data, null: false, default: {}
        t.datetime :responded_at
        t.timestamps
      end
      add_index :message_responses, :status
      add_index :message_responses, :responded_at
    end
  end

  def down
    drop_table :message_responses if table_exists?(:message_responses)

    if index_exists?(:message_deliveries, [ :message_id, :student_id ], unique: true)
      remove_index :message_deliveries, column: [ :message_id, :student_id ]
    end
    remove_index :message_deliveries, :read_at if index_exists?(:message_deliveries, :read_at)

    remove_index :messages, [ :classroom_id, :status ] if index_exists?(:messages, [ :classroom_id, :status ])
    remove_index :messages, :published_at if index_exists?(:messages, :published_at)
    remove_index :messages, :deadline if index_exists?(:messages, :deadline)

    if column_exists?(:messages, :target_all)
      remove_column :messages, :target_all
    end
    change_column_null :messages, :status, true
    change_column_default :messages, :status, from: 0, to: nil
  end
end
