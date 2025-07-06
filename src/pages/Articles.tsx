import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useArticles } from "@/hooks/useArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft } from "lucide-react";

const Articles = () => {
  const { data: articles, isLoading } = useArticles('published');

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            المقالات
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            مجموعة من المقالات المتخصصة في إدارة المنتجات والنمو في الشركات الناشئة
          </p>
        </div>

        {/* Articles Grid - 5 columns for 10 compact cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading ? (
            // Loading skeletons - 10 compact cards
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden shadow-sm border h-64">
                <div className="p-3 h-full flex flex-col">
                  <Skeleton className="w-full h-24 rounded mb-3 flex-shrink-0" />
                  <div className="flex-1 flex flex-col">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-12 w-full flex-1 mb-3" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : articles && articles.length > 0 ? (
            articles.slice(0, 10).map((article) => (
              <Link key={article.id} to={`/article/${article.id}`}>
                <div className="bg-card rounded-lg overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group relative h-64 hover:scale-105">
                  <div className="p-3 h-full flex flex-col" dir="rtl">
                    {/* الصورة في الأعلى - Compact size */}
                    <div className="w-full h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center mb-3">
                      <img
                        src={article.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* المحتوى - Compact layout */}
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-card-foreground mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 min-h-[3rem] mb-3">
                          {article.excerpt}
                        </p>
                      </div>
                      
                      {/* المعلومات في الأسفل - Compact */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-medium text-xs w-fit">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(article.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ChevronLeft className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد مقالات متاحة حالياً.</p>
            </div>
          )}
        </div>

        {/* Load More Button - show if there are more than 10 articles */}
        {articles && articles.length > 10 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              تحميل المزيد من المقالات
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Articles;