RSpec.configure do |config|
  require 'database_cleaner/active_record'
  DatabaseCleaner.strategy = :transaction
  config.before(:suite) { DatabaseCleaner.clean_with(:truncation) }
  config.around(:each) { |ex| DatabaseCleaner.cleaning { ex.run } }
end
