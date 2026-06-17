# Custom Rake tasks for Swagger documentation

namespace :swagger do
  desc "Generate Swagger documentation (shortcut)"
  task :generate do
    puts "Generating Swagger documentation..."
    Rake::Task["rswag:specs:swaggerize"].invoke
    puts "Done! View at: http://localhost:3000/api-docs"
  end

  desc "Watch and auto-generate Swagger on spec changes"
  task :watch do
    require "listen"

    puts "Watching for changes in spec/requests/ ..."
    puts "Swagger will auto-regenerate when you save spec files"
    puts "View at: http://localhost:3000/api-docs"
    puts "Press Ctrl+C to stop\n\n"

    listener = Listen.to("spec/requests") do |modified, added, removed|
      changes = modified + added + removed

      if changes.any? { |path| path.end_with?("_spec.rb") }
        puts "\nDetected changes:"
        changes.each { |path| puts "   #{File.basename(path)}" }

        puts "\nRegenerating Swagger..."
        Rake::Task["rswag:specs:swaggerize"].reenable
        Rake::Task["rswag:specs:swaggerize"].invoke

        puts "Swagger updated at #{Time.now.strftime("%H:%M:%S")}\n"
      end
    end

    listener.start
    sleep
  rescue Interrupt
    puts "\n\nStopped watching. Goodbye!"
  end

  desc "Clean and regenerate Swagger documentation"
  task :clean do
    puts "Cleaning old Swagger files..."
    FileUtils.rm_f("swagger/v1/swagger.json")

    puts "Regenerating Swagger documentation..."
    Rake::Task["rswag:specs:swaggerize"].invoke
    puts "Done! Fresh Swagger generated!"
  end

  desc "Validate Swagger JSON"
  task :validate do
    require "json"

    swagger_file = "swagger/v1/swagger.json"

    unless File.exist?(swagger_file)
      puts "Swagger file not found. Run 'rake swagger:generate' first."
      exit 1
    end

    begin
      swagger_data = JSON.parse(File.read(swagger_file))

      puts "Swagger JSON is valid!"
      puts "\nSummary:"
      puts "   Version: #{swagger_data["info"]["version"]}"
      puts "   Title: #{swagger_data["info"]["title"]}"
      puts "   Endpoints: #{swagger_data["paths"].keys.count}"
      puts "   Schemas: #{swagger_data.dig("components", "schemas")&.keys&.count || 0}"

      puts "\nEndpoints:"
      swagger_data["paths"].each do |path, methods|
        methods.each do |method, details|
          next if method == "parameters"
          puts "   #{method.upcase.ljust(7)} #{path}"
        end
      end
    rescue JSON::ParserError => e
      puts "Invalid JSON: #{e.message}"
      exit 1
    end
  end

  desc "Show Swagger info"
  task :info do
    swagger_file = "swagger/v1/swagger.json"

    unless File.exist?(swagger_file)
      puts "Swagger file not found. Run 'rake swagger:generate' first."
      exit 1
    end

    require "json"
    swagger_data = JSON.parse(File.read(swagger_file))

    puts "Swagger Documentation Info"
    puts "=" * 50
    puts "Title:       #{swagger_data["info"]["title"]}"
    puts "Version:     #{swagger_data["info"]["version"]}"
    puts "Description: #{swagger_data["info"]["description"]}"
    puts "\nServers:"
    swagger_data["servers"].each do |server|
      puts "  - #{server["url"]} (#{server["description"]})"
    end
    puts "\nSwagger UI: http://localhost:3000/api-docs"
    puts "JSON file:  swagger/v1/swagger.json"
    puts "=" * 50
  end
end

# Shortcuts
desc "Generate Swagger (shortcut for swagger:generate)"
task :swag => "swagger:generate"

desc "Watch Swagger specs (shortcut for swagger:watch)"
task :swag_watch => "swagger:watch"
