using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CASE_STUDY_7.ModelBinders
{
    public class IdListBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext context)
        {
            var value = context.ValueProvider
            .GetValue(context.ModelName)
            .FirstValue;

            if (string.IsNullOrWhiteSpace(value))
                return Task.CompletedTask;

            var ids = value.Split(',', StringSplitOptions.RemoveEmptyEntries)
                           .Select(x => x.Trim())
                           .Where(x => !string.IsNullOrEmpty(x))
                           .ToList();

            context.Result = ModelBindingResult.Success(ids);

            return Task.CompletedTask;
        }
    }
}
