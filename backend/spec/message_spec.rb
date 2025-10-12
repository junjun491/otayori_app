require 'rails_helper'

RSpec.describe Message, type: :model do
  it 'validates presence' do
    m = build(:message, title: nil)
    expect(m).not_to be_valid
  end

  it 'publishes to all students when target_all' do
    c = create(:classroom)
    s1 = create(:student, classroom: c)
    s2 = create(:student, classroom: c)
    m = create(:message, classroom: c, status: :draft, target_all: true)

    expect { m.publish!(recipient_ids: nil) }
      .to change { m.message_deliveries.count }.by(2)
    expect(m).to be_published
  end

  it 'publishes to selected student_ids' do
    c = create(:classroom)
    s1 = create(:student, classroom: c)
    s2 = create(:student, classroom: c)
    m = create(:message, classroom: c, status: :draft, target_all: false)

    expect { m.publish!(recipient_ids: [ s1.id ]) }
      .to change { m.message_deliveries.count }.by(1)
  end

  it 'is idempotent for duplicates' do
    c = create(:classroom)
    s = create(:student, classroom: c)
    m = create(:message, classroom: c, status: :draft, target_all: false)
    m.publish!(recipient_ids: [ s.id ])
    expect { m.publish!(recipient_ids: [ s.id ]) }
      .not_to change { m.message_deliveries.count }
  end
end
