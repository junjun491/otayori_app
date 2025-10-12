RSpec.configure do |config|
  require 'database_cleaner/active_record'
  DatabaseCleaner.strategy = :transaction
  config.before(:suite) { DatabaseCleaner.clean_with(:truncation) }
  config.around { |ex| DatabaseCleaner.cleaning { ex.run } }
end
