#!/usr/bin/env ruby
# Script tự động generate lại Swagger khi có thay đổi trong specs

require "listen"

puts "Watching for changes in spec/requests/ ..."
puts "Swagger will auto-regenerate when you save spec files"
puts "Press Ctrl+C to stop\n\n"

listener = Listen.to("spec/requests") do |modified, added, removed|
  changes = modified + added + removed

  if changes.any? { |path| path.end_with?("_spec.rb") }
    puts "\n Detected changes in:"
    changes.each { |path| puts "   - #{path}" }

    puts "\n Regenerating Swagger documentation..."
    system("rake rswag:specs:swaggerize")

    if $?.success?
      puts " Swagger updated successfully!"
      puts " View at: http://localhost:3000/api-docs\n"
    else
      puts " Failed to generate Swagger"
    end
  end
end

listener.start
sleep
